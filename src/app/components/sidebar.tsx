'use client';

import {useUser, SignOutButton} from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar(){
    const {user, isSignedIn} = useUser();
    const pathname = usePathname();

    // 로그인 페이지에서는 사이드바 숨기기
    if (pathname === '/' || pathname === '/sign-in') return null;
    if (!isSignedIn) return null;

    // 메뉴 정보 배열
    const menuItems = [
        { name: 'Tasks', icon: 'checklist', path: '/main' },
        { name: 'Calendar', icon: 'calendar_month', path: '/calendar' },
        { name: 'Chart', icon:'bar_chart', path: '/stats'},
        { name: 'Friends', icon: 'group', path: '/friends' },  
        { name: 'Profile', icon: 'person', path: '/profile' },
    ];

    return(
        <aside className="flex flex-col w-70 bg-white shadow-xl py-10 z-10">

            {/* 프로필 영역 */}
            <div className="flex flex-col items-center px-4 pb-4 border-b border-slate-200">
                <img
                    src={user?.imageUrl || "/default-image.jpg"}
                    alt="profile"
                    className="h-28 w-28 rounded-full mb-4 shadow"
                />
                <h2 className="text-base font-semibold text-slate-800">{user?.fullName || "no name"}</h2>
                <p className="text-sm text-slate-500">{user?.primaryEmailAddress?.emailAddress || "no email"}</p>

                <SignOutButton>
                    <button className="flex items-center gap-1 text-slate-400 mt-5 cursor-pointer hover:text-blue-500">
                    <span className="text-sm">로그아웃</span>
                    </button>
                </SignOutButton>
            </div>
        
            {/* 메뉴 영역 */}
            <nav className="flex-1 mt-6 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    const baseClass = 'flex items-center gap-3 px-7 py-5 rounded-lg hover:bg-slate-100';
                    const colorClass = isActive ? 'text-blue-600' : 'text-slate-600';

                    return (
                        <Link key={item.name} href={item.path} className={`${baseClass} ${colorClass}`}>
                            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>       
    );
}
