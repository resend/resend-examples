{{-- Inbound Email Forwarded Template --}}
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    {{-- Forward header --}}
    <div style="padding: 16px; background: #f5f5f5; border-bottom: 2px solid #e0e0e0; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
            <strong>Forwarded email</strong>
        </p>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #888;">
            <strong>From:</strong> {{ $originalFrom }}
        </p>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #888;">
            <strong>To:</strong> {{ $originalTo }}
        </p>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #888;">
            <strong>Subject:</strong> {{ $originalSubject }}
        </p>
        <p style="margin: 0; font-size: 13px; color: #888;">
            <strong>Date:</strong> {{ $originalDate }}
        </p>
    </div>

    {{-- Original email body --}}
    <div style="padding: 0 16px;">
        {!! $body !!}
    </div>
</div>
