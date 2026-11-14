import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Images } from '../../assets/images';
import { cn } from '@/utils';
import CinemasSection from './components/CinemasSection';
import RoomsSection from './components/RoomsSection';
import { Plus } from 'lucide-react';

type SectionKey = 'dashboard' | 'cinemas' | 'movies' | 'showtimes' | 'rooms' | 'bookings' | 'customers';

const MENU: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                />
            </svg>
        ),
    },
    {
        key: 'cinemas',
        label: 'Rạp chiếu',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                />
            </svg>
        ),
    },
    {
        key: 'movies',
        label: 'Phim',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
            </svg>
        ),
    },
    {
        key: 'showtimes',
        label: 'Suất chiếu',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
            </svg>
        ),
    },
    {
        key: 'rooms',
        label: 'Phòng chiếu',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 4.5h16.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 .75-.75ZM8.25 19.5h7.5"
                />
            </svg>
        ),
    },
    {
        key: 'bookings',
        label: 'Đơn đặt vé',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
                />
            </svg>
        ),
    },
    {
        key: 'customers',
        label: 'Khách hàng',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
            </svg>
        ),
    },
];

const STATS: { label: string; value: string; delta: string }[] = [
    { label: 'Vé bán hôm nay', value: '342', delta: '+18% so với hôm qua' },
    { label: 'Doanh thu hôm nay', value: '48,2 tr', delta: '+12% so với hôm qua' },
    { label: 'Suất chiếu hôm nay', value: '26', delta: '3 suất sắp chiếu' },
    { label: 'Phim đang chiếu', value: '14', delta: '2 phim mới tuần này' },
];

const BOOKING_STATUS_COLOR: Record<string, string> = {
    'Đã thanh toán': 'bg-emerald-500/15 text-emerald-400',
    'Chờ thanh toán': 'bg-amber-500/15 text-amber-400',
    'Đã hủy': 'bg-red-main/15 text-red-main',
};

const RECENT_BOOKINGS = [
    { id: 'BK-1042', customer: 'Nguyễn Văn An', movie: 'Deadpool & Wolverine', showtime: '19:30 · 14/11', seats: 'E5, E6', total: '240.000₫', status: 'Đã thanh toán' },
    { id: 'BK-1041', customer: 'Trần Thị Bích', movie: 'Wicked', showtime: '18:00 · 14/11', seats: 'C10', total: '110.000₫', status: 'Đã thanh toán' },
    { id: 'BK-1040', customer: 'Lê Minh Đức', movie: 'Gladiator II', showtime: '20:15 · 14/11', seats: 'H1, H2, H3', total: '360.000₫', status: 'Chờ thanh toán' },
    { id: 'BK-1039', customer: 'Phạm Thu Hà', movie: 'Moana 2', showtime: '16:45 · 14/11', seats: 'A7, A8', total: '200.000₫', status: 'Đã thanh toán' },
    { id: 'BK-1038', customer: 'Hoàng Quốc Bảo', movie: 'Venom: The Last Dance', showtime: '21:00 · 13/11', seats: 'F12', total: '120.000₫', status: 'Đã hủy' },
];

const SectionPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-2xl font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm text-gray-500">Chức năng đang được phát triển.</p>
    </div>
);

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [section, setSection] = useState<SectionKey>('dashboard');

    return (
        <div className="flex min-h-screen w-full bg-black-main text-left">
            {/* Sidebar */}
            <aside className="w-64 shrink-0 flex flex-col bg-[#101010] border-r border-white/10">
                <NavLink to="/" className="flex items-center gap-3 px-6 py-6 group">
                    <img src={Images.logo} alt="Logo" className="w-8" />
                    <span className="text-white font-semibold text-xl group-hover:text-red-main transition">
                        theMovies
                    </span>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-red-main border border-red-main rounded-lg px-1.5 py-0.5">
                        Admin
                    </span>
                </NavLink>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {MENU.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setSection(item.key)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition',
                                section === item.key
                                    ? 'bg-red-main/15 text-red-main'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5',
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="px-3 py-4 border-t border-white/10 space-y-1">
                    <button
                        onClick={() => navigate('/home')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"
                            />
                        </svg>
                        Back to site
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-main hover:bg-white/5 transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                            />
                        </svg>
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 p-8 overflow-auto">
                {section === 'cinemas' && <CinemasSection />}
                {section === 'rooms' && <RoomsSection />}
                {section === 'dashboard' && (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                                <p className="mt-1 text-sm text-gray-500">Tổng quan hệ thống đặt vé theMovies</p>
                            </div>
                            <button className="flex items-center gap-2 h-11 px-6 rounded-lg bg-red-main text-sm font-semibold text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:bg-red-main/90 hover:shadow-[0_4px_28px_rgba(229,9,20,0.5)] active:scale-95 transition">
                                <Plus className="w-4 h-4" />
                                Tạo suất chiếu
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                            {STATS.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-lg bg-white/[0.045] border border-white/10 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] hover:border-red-main/40 hover:bg-white/[0.06] transition"
                                >
                                    <p className="text-sm text-gray-400">{stat.label}</p>
                                    <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                                    <p className="mt-2 text-xs font-medium text-red-main">{stat.delta}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent table */}
                        <div className="mt-8 rounded-lg bg-white/[0.045] border border-white/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                                <h2 className="text-lg font-semibold text-white">Đơn đặt vé gần đây</h2>
                                <button className="text-sm text-gray-400 hover:text-red-main transition">
                                    View all
                                </button>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 text-left">
                                        <th className="px-6 py-3 font-medium">Mã vé</th>
                                        <th className="px-6 py-3 font-medium">Khách hàng</th>
                                        <th className="px-6 py-3 font-medium">Phim</th>
                                        <th className="px-6 py-3 font-medium">Suất chiếu</th>
                                        <th className="px-6 py-3 font-medium">Ghế</th>
                                        <th className="px-6 py-3 font-medium">Tổng tiền</th>
                                        <th className="px-6 py-3 font-medium">Trạng thái</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {RECENT_BOOKINGS.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-t border-white/5 text-gray-300 hover:bg-white/5 transition"
                                        >
                                            <td className="px-6 py-4 text-red-main font-medium">{row.id}</td>
                                            <td className="px-6 py-4 text-white font-medium">{row.customer}</td>
                                            <td className="px-6 py-4">{row.movie}</td>
                                            <td className="px-6 py-4">{row.showtime}</td>
                                            <td className="px-6 py-4">{row.seats}</td>
                                            <td className="px-6 py-4">{row.total}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap',
                                                        BOOKING_STATUS_COLOR[row.status] ?? 'bg-white/10 text-gray-400',
                                                    )}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button className="text-gray-400 hover:text-white transition">
                                                    Chi tiết
                                                </button>
                                                <button className="text-gray-400 hover:text-red-main transition">
                                                    Hủy vé
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {section !== 'dashboard' && section !== 'cinemas' && section !== 'rooms' && (
                    <SectionPlaceholder title={MENU.find((m) => m.key === section)?.label ?? ''} />
                )}
            </main>
        </div>
    );
};

export default AdminPage;
