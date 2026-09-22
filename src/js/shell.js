// SkillsTrack Shell JavaScript

import {
    auth,
    db
} from "../../Firebase/firebase.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const NAV_ITEMS = [
    {
        key: "dashboard",
        label: "Dashboard"
    },
    {
        key: "tasks",
        label: "My Tasks",
        href: "tasks.html"
    },
    {
        key: "resources",
        label: "Resources",
        href: "resources.html"
    },
    {
        key: "progress",
        label: "Progress report",
        href: "progress.html"
    },
    {
        key: "support",
        label: "Support Booking",
        href: "support-booking.html"
    },
    {
        key: "game",
        label: "Mini game",
        href: "mini-game.html"
    }
];


export async function renderShell(
    active,
    profile = null
) {

    const fbUser =
        auth.currentUser;


    if (!fbUser) {

        window.location.href =
            "login.html";

        return;

    }


    // Get profile from Firestore if not supplied
    if (!profile) {

        const profileSnap =
            await getDoc(
                doc(
                    db,
                    "users",
                    fbUser.uid
                )
            );


        if (!profileSnap.exists()) {

            window.location.href =
                "login.html";

            return;

        }


        profile =
            profileSnap.data();

    }


    const dashboardHref =
        profile.role === "facilitator"
            ? "dashboard-facilitator.html"
            : "dashboard-learner.html";


    const sidebar =
        document.getElementById("sidebar");


    if (sidebar) {

        const links =
            NAV_ITEMS.map(function(item) {

                const href =
                    item.key === "dashboard"
                        ? dashboardHref
                        : item.href;


                const isActive =
                    item.key === active;


                return `
                    <a
                        class="nav-link${isActive ? " active" : ""}"
                        href="${href}">
                        ${item.label}
                    </a>
                `;

            }).join("");


        sidebar.innerHTML = `

            <div class="logo">

                <span class="logo-mark">
                    S
                </span>

                <div>

                    <div class="logo-name">
                        SkillsTrack
                    </div>

                    <div class="logo-tag">
                        LEARN. PRACTICE. GROW.
                    </div>

                </div>

            </div>


            <nav class="nav">
                ${links}
            </nav>


            <button
                class="nav-link logout-link"
                id="logout-btn">
                Logout
            </button>

        `;


        document.getElementById(
            "logout-btn"
        ).addEventListener(
            "click",
            async function() {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to log out?"
                    );


                if (!confirmLogout) {
                    return;
                }


                await signOut(auth);


                window.location.href =
                    "login.html";

            }
        );

    }


    const topbar =
        document.getElementById("topbar");


    if (topbar) {

        topbar.innerHTML = `

            <div class="topbar-title">
                SKILLSTRACK PORTAL
            </div>


            <a
                class="topbar-profile"
                href="profile.html"
                title="${profile.name}">

                <span>
                    Profile
                </span>

                <span class="avatar"></span>

            </a>

        `;

    }

}