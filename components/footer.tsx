import Link from "next/link";

export default function Footer() {
    return (
        <footer
            className="text-white mt-auto"
            style={{ background: "linear-gradient(135deg, #003366 0%, #1d4ed8 100%)" }}
        >
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">

                    {/* Column 1: Social/Action Links */}
                    <div className="flex flex-col items-center gap-2">
                        <p className="font-semibold mb-2">Click below to connect with us!</p>

                        <a
                            href="https://www.facebook.com/sceconomics/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-200 transition-colors"
                        >
                            Facebook
                        </a>

                        <a
                            href="mailto:sccee@moore.sc.edu"
                            className="underline hover:text-blue-200 transition-colors"
                        >
                            Email
                        </a>

                        <a
                            href="https://visitor.r20.constantcontact.com/manage/optin?v=001tAx93SxsVPfTe3Gw2RR1MtuJgFSCtw_O19Vr9eJsmHtG-J-_Xk1Sg7Q3HiJZshP0jdm3zsZrMlk4xk02hIn3rjZBgL8wSaXK3CPSnDIIcEsZ79r3-aM3OZcEPPPCJ4yCHrd-Qr177R1WXfkRyGldfBHJqxDj3cNLxWQhc27PWV4yYMWAbTEiBQ%3D%3D"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-200 transition-colors"
                        >
                            Subscribe
                        </a>

                        <a
                            href="https://donate.sceconomics.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-200 transition-colors"
                        >
                            Donate
                        </a>
                    </div>

                    {/* Column 2: Contact Info */}
                    <div className="flex flex-col items-center gap-1">
                        <p className="font-semibold mb-2">SC Economics</p>
                        <p className="text-blue-100">Darla Moore School of Business</p>
                        <p className="text-blue-100">1014 Greene Street</p>
                        <p className="text-blue-100">Columbia, SC 29208</p>
                        <p className="text-blue-100 mt-2">Phone: 803-777-8676</p>
                    </div>

                    {/* Column 3: Associations */}
                    <div className="flex flex-col items-center gap-4">
                        <p className="font-semibold">SC Economics is associated with:</p>

                        <a
                            href="https://www.councilforeconed.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src="/cee-logo.png"
                                alt="Council for Economic Education"
                                className="max-w-[200px]"
                            />
                        </a>

                        <a
                            href="https://www.youtube.com/@SCEconomics"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/320px-YouTube_Logo_2017.svg.png"
                                alt="Subscribe to our YouTube Channel"
                                className="max-w-[160px]"
                            />
                        </a>
                    </div>

                </div>

                {/* Copyright */}
                <div className="text-center text-sm text-blue-200 mt-8 border-t border-white/20 pt-4">
                    © {new Date().getFullYear()} SC Economics. All rights reserved.
                </div>
            </div>
        </footer>
    );
}