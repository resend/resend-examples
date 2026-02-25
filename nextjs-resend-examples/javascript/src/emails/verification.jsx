/**
 * Email Verification Template
 *
 * Used for email verification flows (e.g., with better-auth).
 * Contains a verification link and expiration notice.
 *
 * @param {{ verificationUrl: string, expiresIn?: string }} props
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

export function VerificationEmail({
  verificationUrl,
  expiresIn = '24 hours',
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your email address</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <Text className="text-2xl font-bold text-black">Acme</Text>

            <Heading className="text-2xl font-bold text-gray-900 mt-8">
              Verify your email
            </Heading>

            <Text className="text-base text-gray-700 leading-6">
              Click the button below to verify your email address and complete
              your account setup.
            </Text>

            <Button
              href={verificationUrl}
              className="bg-black text-white px-6 py-3 rounded-md font-medium mt-4 inline-block box-border"
            >
              Verify Email Address
            </Button>

            <Text className="text-sm text-gray-500 mt-4">
              This link will expire in {expiresIn}.
            </Text>

            <Hr className="border-gray-200 my-8" />

            <Text className="text-sm text-gray-500">
              If you didn&apos;t request this verification, you can safely
              ignore this email.
            </Text>

            {/* Fallback link for email clients that don't support buttons */}
            <Text className="text-xs text-gray-400 mt-4">
              If the button doesn&apos;t work, copy and paste this URL into your
              browser:
            </Text>
            <Text className="text-xs text-gray-400 break-all">
              {verificationUrl}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

VerificationEmail.PreviewProps = {
  verificationUrl: 'https://example.com/verify?token=abc123xyz',
  expiresIn: '24 hours',
};

export default VerificationEmail;
