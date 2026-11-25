import { getSession } from "@/lib/session";
import { startOver } from "./actions";
import { CodeForm, EmailForm } from "./forms";

export default async function Page() {
	const session = await getSession();
	const { pending, verifiedEmail, notice } = session;

	return (
		<main className="container">
			<div className="card">
				{verifiedEmail ? (
					<>
						<div className="badge">Verified</div>
						<h1 className="title">Email verified</h1>
						<p className="description">
							<strong>{verifiedEmail}</strong> has been verified.
						</p>
						<form action={startOver}>
							<button type="submit" className="button button-secondary">
								Verify another email
							</button>
						</form>
					</>
				) : pending ? (
					<>
						<h1 className="title">Check your inbox</h1>
						<p className="description">
							We sent a 6 digit code to <strong>{pending.email}</strong>. It
							expires in 10 minutes.
						</p>
						<CodeForm />
						<form action={startOver}>
							<button type="submit" className="link">
								Use a different email
							</button>
						</form>
					</>
				) : (
					<>
						<h1 className="title">Verify your email</h1>
						<p className="description">
							Enter your email address and we'll send you a 6 digit code.
						</p>
						<EmailForm notice={notice} />
					</>
				)}
			</div>
		</main>
	);
}
