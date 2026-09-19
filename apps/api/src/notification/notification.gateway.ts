import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { verify, JwtPayload } from 'jsonwebtoken';

import { PrismaService } from '../prisma/prisma.service';

interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
}

interface SocketUser {
  id: string;
  email: string;
}

interface AuthenticatedSocket extends Socket {
  data: {
    user?: SocketUser;
    branchId?: string;
  };
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ------------------------------------------------------------
  // CONNECTION
  // ------------------------------------------------------------

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Socket connecting: ${client.id}`);

    try {
      const user = await this.authenticateSocket(client);

      if (!user) {
        this.logger.warn(`Socket authentication failed: ${client.id}`);

        client.disconnect(true);
        return;
      }

      client.data.user = user;

      this.logger.log(`Socket authenticated: ${client.id} (${user.email})`);
    } catch (error) {
      this.logger.error(`Socket authentication error: ${client.id}`, error);

      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  // ------------------------------------------------------------
  // JOIN BRANCH
  // ------------------------------------------------------------

  @SubscribeMessage('join-branch')
  async handleJoinBranch(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      organizationId: string;
      branchId: string;
    },
  ) {
    /*
     * IMPORTANT:
     *
     * handleConnection() is async.
     * The browser can emit join-branch before
     * client.data.user has been populated.
     *
     * So authenticate here as a fallback.
     */

    let user = client.data.user;

    if (!user) {
      const authenticatedUser = await this.authenticateSocket(client);

      if (!authenticatedUser) {
        this.logger.warn(`Unauthorized join attempt: ${client.id}`);

        return {
          success: false,
          message: 'Unauthorized',
        };
      }

      user = authenticatedUser;
      client.data.user = authenticatedUser;
    }

    if (!data?.organizationId || !data?.branchId) {
      return {
        success: false,
        message: 'Organization and branch are required',
      };
    }

    this.logger.log(`User ${user.email} requesting branch ${data.branchId}`);

    // ----------------------------------------------------------
    // MEMBERSHIP CHECK
    // ----------------------------------------------------------

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.id,

        organizationId: data.organizationId,

        OR: [
          {
            branchId: data.branchId,
          },
          {
            branchId: null,
          },
        ],
      },

      select: {
        id: true,
        branchId: true,
        role: true,

        organization: {
          select: {
            id: true,
            status: true,
          },
        },

        branch: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!membership) {
      this.logger.warn(
        `User ${user.email} has no access to branch ${data.branchId}`,
      );

      return {
        success: false,
        message: 'You do not have access to this branch',
      };
    }

    // ----------------------------------------------------------
    // ORGANIZATION CHECK
    // ----------------------------------------------------------

    if (membership.organization.status !== 'ACTIVE') {
      return {
        success: false,
        message: 'Organization is not active',
      };
    }

    // ----------------------------------------------------------
    // BRANCH CHECK
    // ----------------------------------------------------------

    if (
      membership.branchId &&
      membership.branch &&
      !membership.branch.isActive
    ) {
      return {
        success: false,
        message: 'Branch is not active',
      };
    }

    // ----------------------------------------------------------
    // LEAVE PREVIOUS BRANCH
    // ----------------------------------------------------------

    if (client.data.branchId) {
      const previousRoom = this.getBranchRoom(client.data.branchId);

      client.leave(previousRoom);

      this.logger.log(`Socket ${client.id} left ${previousRoom}`);
    }

    // ----------------------------------------------------------
    // JOIN NEW BRANCH
    // ----------------------------------------------------------

    const room = this.getBranchRoom(data.branchId);

    client.join(room);

    client.data.branchId = data.branchId;

    this.logger.log(`Socket ${client.id} joined ${room}`);

    return {
      success: true,
      organizationId: data.organizationId,
      branchId: data.branchId,
      room,
    };
  }

  // ------------------------------------------------------------
  // LEAVE BRANCH
  // ------------------------------------------------------------

  @SubscribeMessage('leave-branch')
  handleLeaveBranch(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      branchId: string;
    },
  ) {
    if (!data?.branchId) {
      return {
        success: false,
        message: 'Branch ID is required',
      };
    }

    const room = this.getBranchRoom(data.branchId);

    client.leave(room);

    if (client.data.branchId === data.branchId) {
      client.data.branchId = undefined;
    }

    this.logger.log(`Socket ${client.id} left ${room}`);

    return {
      success: true,
    };
  }

  // ------------------------------------------------------------
  // EMIT NOTIFICATION
  // ------------------------------------------------------------

  emitToBranch(branchId: string, notification: unknown) {
    const room = this.getBranchRoom(branchId);

    this.logger.log(`Emitting notification to ${room}`);

    this.server.to(room).emit('notification:new', notification);
  }

  // ------------------------------------------------------------
  // AUTHENTICATE SOCKET
  // ------------------------------------------------------------

  private async authenticateSocket(client: Socket): Promise<SocketUser | null> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`No token provided by socket ${client.id}`);

        return null;
      }

      const secret = this.configService.get<string>('JWT_SECRET');

      if (!secret) {
        this.logger.error('JWT_SECRET is not configured');

        return null;
      }

      const payload = verify(token, secret) as TokenPayload;

      if (!payload.sub || !payload.email) {
        this.logger.warn(`Invalid token payload from socket ${client.id}`);

        return null;
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },

        select: {
          id: true,
          email: true,
          status: true,
        },
      });

      if (!user) {
        this.logger.warn(`User ${payload.sub} not found`);

        return null;
      }

      if (user.status !== 'ACTIVE') {
        this.logger.warn(`User ${user.email} is not active`);

        return null;
      }

      return {
        id: user.id,
        email: user.email,
      };
    } catch (error) {
      this.logger.warn(`Socket authentication failed: ${client.id}`);

      return null;
    }
  }

  // ------------------------------------------------------------
  // TOKEN
  // ------------------------------------------------------------

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken.length > 0) {
      return this.normalizeToken(authToken);
    }

    const authorization = client.handshake.headers?.authorization;

    if (
      typeof authorization === 'string' &&
      authorization.startsWith('Bearer ')
    ) {
      return authorization.substring(7);
    }

    return null;
  }

  private normalizeToken(token: string): string {
    if (token.startsWith('Bearer ')) {
      return token.substring(7);
    }

    return token;
  }

  private getBranchRoom(branchId: string) {
    return `branch:${branchId}`;
  }
}
