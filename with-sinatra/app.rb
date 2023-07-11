require "sinatra"
require "resend"

set :port, 5000
set :bind, "0.0.0.0"

Resend.api_key = ENV["RESEND_API_KEY"]

get "/" do

  content_type :json

  params = {
    from: 'onboarding@resend.dev',
    to: 'delivered@resend.dev',
    subject: 'hello world',
    html: '<strong>it works!</strong>',
  }

  Resend::Emails.send(params)

  { ok: true }.to_json
end