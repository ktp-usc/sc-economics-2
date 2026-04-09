import Link from 'next/link';

export default function NotFound() {
    return (
        <div
            style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}
            className="flex flex-col items-center justify-center text-center px-4"
        >
            <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-lg text-gray-600 mb-6">
                Sorry, we couldn&apos;t find that page.
            </p>

            <Link
                href="/"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
                Go Home
            </Link>
        </div>
    );
}