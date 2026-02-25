/**
 * Password Reset Email Template
 *
 * Sent when users request to reset their password.
 * Used with better-auth or any authentication system.
 *
 * @param {{ resetUrl: string, expiresIn?: string }} props
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components';

export function PasswordResetEmail({
  resetUrl,
  expiresIn = '1 hour',
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your password</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <Text className="text-2xl font-bold text-black">Acme</Text>

            <Heading className="text-2xl font-bold text-gray-900 mt-8">
              Reset your password
            </Heading>

            <Text className="text-base text-gray-700 leading-6">
              We received a request to reset your password. Click the button
              below to choose a new password.
            </Text>

            <Button
              href={resetUrl}
              className="bg-black text-white px-6 py-3 rounded-md font-medium mt-4 inline-block box-border"
            >
              Reset Password
            </Button>

            <Text className="text-sm text-gray-500 mt-4">
              This link will expire in {expiresIn}.
            </Text>

            <Hr className="border-gray-200 my-8" />

            <Text className="text-sm text-gray-500">
              If you didn&apos;t request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>

            {/* Security notice */}
            <div className="bg-yellow-50 border border-solid border-yellow-200 rounded-md p-4 mt-6">
              <Text className="text-sm text-yellow-800 m-0">
                <strong>Security tip:</strong> Never share this link with
                anyone. Acme will never ask for your password via email.
              </Text>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

PasswordResetEmail.PreviewProps = {
  resetUrl: 'https://example.com/reset-password?token=abc123xyz',
  expiresIn: '1 hour',
};

export default PasswordResetEmail;
