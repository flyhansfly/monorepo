"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
	const router = useRouter();
	const onBeginForm = () => {
		console.log("Navigating to /intake-form");
		router.push("/intake-form");
	};
	return (
		<main className="bg-background text-foreground font-sans">
			{/* Hero Section */}
			<section className="flex flex-wrap items-center p-10">
				<div className="flex-1 p-5">
					<h1 className="text-4xl font-bold">
						Welcome to{" "}
						<span className="text-primary">your fresh start!</span>
					</h1>
					<p className="mt-4 font-serif text-lg">
						We help you find the real cause of your pain and create a clear treatment plan to reset your body — like hitting "Ctrl + Alt + Delete" on discomfort.
					</p>
					<p className="mt-2 font-serif text-lg">
						Our goal is simple: get you back to zero pain so you can move with freedom, feel strong again, and start building the life you want — not the one limited by pain.
					</p>
					<button
						className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
						onClick={onBeginForm}
					>
						Begin Form
					</button>
				</div>
				<div className="flex-1 text-center">
					<Image
						src="/images/Transparent_Stingray_Modified.png"
						alt="Dr. Ray"
						width={500}
						height={500}
						className="rounded"
						priority
					/>
				</div>
			</section>

			{/* Process Explanation Section */}
			<section className="p-10">
				<h2 className="text-2xl font-bold text-center">Our Intake Process</h2>
				<p className="mt-2 font-serif text-lg text-center">
					Here's how it works:
				</p>
				<div className="mt-8 grid gap-8 sm:grid-cols-1 md:grid-cols-3">
					<div className="relative flex flex-col bg-card shadow-sm border border-slate-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
						<h3 className="text-xl font-semibold text-card-foreground mb-2">1. Fill Out the Intake Form</h3>
						<p className="text-muted-foreground font-light">
							Provide details about your symptoms and medical history.
						</p>
					</div>
					<div className="relative flex flex-col bg-card shadow-sm border border-slate-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
						<h3 className="text-xl font-semibold text-card-foreground mb-2">2. Review and Analyze</h3>
						<p className="text-muted-foreground font-light">
							We'll analyze your responses to create a preliminary diagnosis and treatment plan.
						</p>
					</div>
					<div className="relative flex flex-col bg-card shadow-sm border border-slate-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
						<h3 className="text-xl font-semibold text-card-foreground mb-2">3. Get Your Treatment Program</h3>
						<p className="text-muted-foreground font-light">
							Receive a detailed plan, including exercises and therapy tailored to your needs.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
