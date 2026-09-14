import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly resend = new Resend(
    process.env.RESEND_API_KEY,
  );

  private readonly from =
    process.env.MAIL_FROM ??
    'onboarding@resend.dev';

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      this.logger.error(
        `Failed to send email to ${options.to}`,
        error,
      );

      throw new Error(
        error.message || 'Failed to send email',
      );
    }

    this.logger.log(
      `Email sent to ${options.to}: ${data?.id}`,
    );

    return data;
  }

  async sendInvitationEmail(options: {
    to: string;
    organizationName: string;
    branchName?: string | null;
    role: string;
    invitationUrl: string;
    expiresAt: Date;
  }) {
    const {
      to,
      organizationName,
      branchName,
      role,
      invitationUrl,
      expiresAt,
    } = options;

    const formattedExpiry = expiresAt.toLocaleDateString(
      'en-PH',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    const branchText = branchName
      ? `You have been invited to join the <strong>${branchName}</strong> branch.`
      : 'You have been invited to join this organization.';

    return this.sendMail({
      to,
      subject: `You're invited to join ${organizationName} on Cofflo`,
      text: [
        `You have been invited to join ${organizationName} on Cofflo.`,
        branchName ? `Branch: ${branchName}` : '',
        `Role: ${role}`,
        `Accept your invitation: ${invitationUrl}`,
        `This invitation expires on ${formattedExpiry}.`,
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#252525;">
            <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;padding:40px;">
              <h1 style="margin:0 0 12px;font-size:28px;">
                You're invited to Cofflo
              </h1>

              <p style="font-size:16px;line-height:1.6;">
                You have been invited to join
                <strong>${organizationName}</strong>.
              </p>

              <p style="font-size:16px;line-height:1.6;">
                ${branchText}
              </p>

              <div style="margin:24px 0;padding:20px;background:#f5f5f0;border-radius:12px;">
                <p style="margin:0 0 8px;">
                  <strong>Role:</strong> ${role}
                </p>
                <p style="margin:0;">
                  <strong>Expires:</strong> ${formattedExpiry}
                </p>
              </div>

              <a
                href="${invitationUrl}"
                style="display:inline-block;padding:14px 24px;background:#1f7a5a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;"
              >
                Accept Invitation
              </a>

              <p style="margin-top:28px;font-size:13px;line-height:1.5;color:#777;">
                If you did not expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });
  }
}