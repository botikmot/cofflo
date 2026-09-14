import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

import { MembershipRole } from '@prisma/client';

import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InvitationsService {

  private readonly logger = new Logger(
    InvitationsService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(
    organizationId: string,
    dto: CreateInvitationDto,
  ) {
    const email = dto.email.trim().toLowerCase();

    // Verify if the branch belongs to the organization
    if (dto.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: {
          id: dto.branchId,
          organizationId,
        },
      });

      if (!branch) {
        throw new BadRequestException(
          'Branch does not belong to this organization',
        );
      }
    }

    // Check if the email already has a membership
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        memberships: {
          where: {
            organizationId,
          },
        },
      },
    });

    if (
      existingUser &&
      existingUser.memberships.length > 0
    ) {
      throw new ConflictException(
        'This user is already a member of the organization',
      );
    }

    // Check existing pending invitation
    const existingInvitation =
      await this.prisma.invitation.findFirst({
        where: {
          organizationId,
          email,
          status: 'PENDING',
        },
      });

    if (existingInvitation) {
      if (
        existingInvitation.expiresAt.getTime() > Date.now()
      ) {
        throw new ConflictException(
          'A pending invitation already exists for this email',
        );
      }

      // Mark expired invitation
      await this.prisma.invitation.update({
        where: {
          id: existingInvitation.id,
        },
        data: {
          status: 'EXPIRED',
        },
      });
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    const invitation = await this.prisma.invitation.create({
      data: {
        organizationId,
        branchId: dto.branchId ?? null,
        email,
        role: dto.role ?? MembershipRole.STAFF,
        tokenHash,
        expiresAt,
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';

    const invitationUrl = `${webUrl}/invitations/accept?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      await this.mailService.sendInvitationEmail({
        to: invitation.email,
        organizationName: invitation.organization.name,
        branchName: invitation.branch?.name,
        role: invitation.role,
        invitationUrl,
        expiresAt: invitation.expiresAt,
      });
    } else {
      this.logger.warn(
        'RESEND_API_KEY is not configured. Skipping invitation email.',
      );
    }

    // Development only.
    // Later, token will be sent through email.
    return {
      ...invitation,
      token,
      invitationUrl,
    };
  }

  async findByToken(token: string) {
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const invitation = await this.prisma.invitation.findUnique({
      where: {
        tokenHash,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException(
        'Invitation not found or invalid token',
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `Invitation is already ${invitation.status.toLowerCase()}`,
      );
    }

    if (invitation.expiresAt.getTime() < Date.now()) {
      await this.prisma.invitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: 'EXPIRED',
        },
      });

      throw new BadRequestException(
        'Invitation has expired',
      );
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      organization: invitation.organization,
      branch: invitation.branch,
    };
  }

  async accept(
    token: string,
    dto: AcceptInvitationDto,
  ) {
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const invitation = await this.prisma.invitation.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!invitation) {
      throw new NotFoundException(
        'Invitation not found or invalid token',
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `Invitation is already ${invitation.status.toLowerCase()}`,
      );
    }

    if (invitation.expiresAt.getTime() < Date.now()) {
      await this.prisma.invitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: 'EXPIRED',
        },
      });

      throw new BadRequestException(
        'Invitation has expired',
      );
    }

    const email = invitation.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists. Please log in instead.',
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      12,
    );

    const result = await this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName: dto.firstName.trim(),
            lastName: dto.lastName?.trim() || null,
            status: 'ACTIVE',
          },
        });

        const membership = await tx.membership.create({
          data: {
            userId: user.id,
            organizationId: invitation.organizationId,
            branchId: invitation.branchId,
            role: invitation.role,
          },
        });

        const updatedInvitation =
          await tx.invitation.update({
            where: {
              id: invitation.id,
            },
            data: {
              status: 'ACCEPTED',
              acceptedAt: new Date(),
            },
          });

        return {
          user,
          membership,
          invitation: updatedInvitation,
        };
      },
    );

    const { passwordHash: _, ...safeUser } = result.user;

    return {
      message: 'Invitation accepted successfully',
      user: safeUser,
      membership: result.membership,
      invitation: {
        id: result.invitation.id,
        status: result.invitation.status,
        acceptedAt: result.invitation.acceptedAt,
      },
    };
  }

  async findAllByOrganization(organizationId: string) {
    const invitations = await this.prisma.invitation.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const now = new Date();

    return invitations.map((invitation) => {
      let status = invitation.status;

      if (
        status === 'PENDING' &&
        invitation.expiresAt.getTime() < now.getTime()
      ) {
        status = 'EXPIRED';
      }

      return {
        ...invitation,
        status,
      };
    });
  }

  async findOneByOrganization(
    organizationId: string,
    invitationId: string,
  ) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
        updatedAt: true,
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException(
        'Invitation not found',
      );
    }

    let status = invitation.status;

    if (
      status === 'PENDING' &&
      invitation.expiresAt.getTime() < Date.now()
    ) {
      status = 'EXPIRED';
    }

    return {
      ...invitation,
      status,
    };
  }

  async cancel(
    organizationId: string,
    invitationId: string,
  ) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
    });

    if (!invitation) {
      throw new NotFoundException(
        'Invitation not found',
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot cancel an invitation with ${invitation.status} status`,
      );
    }

    if (invitation.expiresAt.getTime() < Date.now()) {
      await this.prisma.invitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: 'EXPIRED',
        },
      });

      throw new BadRequestException(
        'Invitation has already expired',
      );
    }

    return this.prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: 'CANCELLED',
      },
      select: {
        id: true,
        organizationId: true,
        branchId: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async resend(
    organizationId: string,
    invitationId: string,
  ) {
    const oldInvitation = await this.prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
    });

    if (!oldInvitation) {
      throw new NotFoundException(
        'Invitation not found',
      );
    }

    if (oldInvitation.status === 'ACCEPTED') {
      throw new BadRequestException(
        'Accepted invitations cannot be resent',
      );
    }

    // Check if the invitation email already belongs
    // to an existing member of this organization
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: oldInvitation.email,
      },
      include: {
        memberships: {
          where: {
            organizationId,
          },
        },
      },
    });

    if (
      existingUser &&
      existingUser.memberships.length > 0
    ) {
      throw new ConflictException(
        'This user is already a member of the organization',
      );
    }

    const token = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    const result = await this.prisma.$transaction(
      async (tx) => {
        // Cancel the previous invitation
        await tx.invitation.update({
          where: {
            id: oldInvitation.id,
          },
          data: {
            status: 'CANCELLED',
          },
        });

        // Create a new invitation
        const newInvitation = await tx.invitation.create({
          data: {
            organizationId,
            branchId: oldInvitation.branchId,
            email: oldInvitation.email,
            role: oldInvitation.role,
            tokenHash,
            expiresAt,
          },
          select: {
            id: true,
            organizationId: true,
            branchId: true,
            email: true,
            role: true,
            status: true,
            expiresAt: true,
            createdAt: true,
            branch: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        return newInvitation;
      },
    );

    const webUrl =
      process.env.WEB_URL ??
      'http://localhost:3000';

    const invitationUrl =
      `${webUrl}/invitations/accept?token=${token}`;

    await this.mailService.sendInvitationEmail({
      to: result.email,
      organizationName: result.organization.name,
      branchName: result.branch?.name,
      role: result.role,
      invitationUrl,
      expiresAt: result.expiresAt,
    });

    // Development only.
    // Later, send this token through email.
    return {
      ...result,
      token,
      invitationUrl,
    };
  }

}