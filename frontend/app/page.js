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
		<main className="bg-[#EBEBEB] text-[#1D1D1D] font-sans">
			{/* Hero Section */}
			<section className="flex flex-wrap items-center p-10">
				<div className="flex-1 p-5">
					<h1 className="text-4xl font-bold">
						Welcome to{" "}
						<span className="text-[#3D5AFE]">Your Path to Recovery</span>
					</h1>
					<p className="mt-4 font-serif text-lg">
						Start your journey to better health today. Fill out the intake form
						to help us understand your condition and design a personalized
						treatment plan tailored to your needs.
					</p>
					<button
						className="mt-6 px-6 py-3 bg-[#3D5AFE] text-white rounded hover:bg-blue-700 transition-colors"
						onClick={onBeginForm}
					>
						Begin Form
					</button>
				</div>
				<div className="flex-1 text-center">
					<Image
						src="/images/Transparent_Stingray_Modified.png" // Replace with your stingray image path
						alt="Dr. Ray"
						width={500}
						height={500}
						className="rounded"
					/>
				</div>
			</section>

			{/* Process Explanation Section */}
			<section className="p-10">
				<h2 className="text-2xl font-bold text-center">Our Intake Process</h2>
				<p className="mt-2 font-serif text-lg text-center">
					Here’s how it works:
				</p>
				<div className="mt-8 grid gap-8 sm:grid-cols-1 md:grid-cols-3">
					<div className="bg-gray-100 p-6 rounded text-center">
						<h3 className="text-xl font-bold">1. Fill Out the Intake Form</h3>
						<p className="mt-3">
							Provide details about your symptoms and medical history.
						</p>
					</div>
					<div className="bg-gray-100 p-6 rounded text-center">
						<h3 className="text-xl font-bold">2. Review and Analyze</h3>
						<p className="mt-3">
							We’ll analyze your responses to create a preliminary diagnosis and
							treatment plan.
						</p>
					</div>
					<div className="bg-gray-100 p-6 rounded text-center">
						<h3 className="text-xl font-bold">3. Get Your Treatment Program</h3>
						<p className="mt-3">
							Receive a detailed plan, including exercises and therapy tailored
							to your needs.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
