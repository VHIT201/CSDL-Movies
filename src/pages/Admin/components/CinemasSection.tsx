import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import SeatMapEditor, { SeatLayout } from './SeatMapEditor';
import { useCinemaStore } from '@/store/cinemaStore';
import type { Cinema, Room, Showtime } from '@/store/cinemaStore';

const SHOWTIME_STATUS_COLOR: Record<Showtime['status'], string> = {
    'Đang bán': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Gần đầy': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Hết vé': 'bg-red-main/15 text-red-main border-red-main/30',
};

const FORMAT_COLOR: Record<Room['format'], string> = {
    IMAX: 'bg-red-main/15 text-red-main border-red-main/30',
    '3D': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    '2D': 'bg-white/10 text-gray-300 border-white/15',
};

const TIME_PRESETS = ['09:30', '11:45', '14:00', '16:15', '18:30', '20:45'];

const CinemasSection: React.FC = () => {
    const [query, setQuery] = useState('');
    const [cinemaFilter, setCinemaFilter] = useState('all');
    const [movieFilter, setMovieFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [openCinemaId, setOpenCinemaId] = useState<string | null>(null);
    const cinemas = useCinemaStore((s) => s.cinemas);
    const addShowtimesAction = useCinemaStore((s) => s.addShowtimes);
    const saveSeatMapAction = useCinemaStore((s) => s.saveSeatMap);
    const [addShowtimeOpen, setAddShowtimeOpen] = useState(false);
    const [addShowtimePrefill, setAddShowtimePrefill] = useState<{ cinemaId?: string; roomId?: string }>({});
    const [seatMapTarget, setSeatMapTarget] = useState<{ cinemaId: string; roomId: string } | null>(null);

    const totalRooms = cinemas.reduce((sum, c) => sum + c.rooms.length, 0);
    const totalShowtimes = cinemas.reduce(
        (sum, c) => sum + c.rooms.reduce((s, r) => s + r.showtimes.length, 0),
        0,
    );
    const allMovies = useMemo(
        () =>
            Array.from(
                new Set(cinemas.flatMap((c) => c.rooms.flatMap((r) => r.showtimes.map((s) => s.movie)))),
            ).sort(),
        [cinemas],
    );

    // Lọc rạp + suất chiếu theo query/filters — scale tốt khi nhiều rạp
    const visibleCinemas = useMemo(() => {
        const q = query.trim().toLowerCase();
        return cinemas.map((cinema) => {
            if (cinemaFilter !== 'all' && cinema.id !== cinemaFilter) return null;

            const cinemaNameMatch =
                !q ||
                cinema.name.toLowerCase().includes(q) ||
                cinema.address.toLowerCase().includes(q);

            const rooms = cinema.rooms.map((room) => ({
                ...room,
                showtimes: room.showtimes.filter(
                    (st) =>
                        (movieFilter === 'all' || st.movie === movieFilter) &&
                        (statusFilter === 'all' || st.status === statusFilter) &&
                        (cinemaNameMatch || st.movie.toLowerCase().includes(q)),
                ),
            }));

            const hasShowtimes = rooms.some((r) => r.showtimes.length > 0);
            if (!cinemaNameMatch && !hasShowtimes) return null;
            return { ...cinema, rooms };
        }).filter((c): c is Cinema => c !== null);
    }, [query, cinemaFilter, movieFilter, statusFilter, cinemas]);

    const openCinema = visibleCinemas.find((c) => c.id === openCinemaId) ?? null;

    // Đóng modal bằng phím Escape
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpenCinemaId(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const handleAddShowtimes = (cinemaId: string, roomIds: string[], movie: string, times: string[]) => {
        addShowtimesAction(cinemaId, roomIds, movie, times);
        setAddShowtimeOpen(false);
        setAddShowtimePrefill({});
    };

    const handleSaveSeatMap = (cinemaId: string, roomId: string, layout: SeatLayout) => {
        saveSeatMapAction(cinemaId, roomId, layout);
        setSeatMapTarget(null);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Rạp chiếu</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {cinemas.length} rạp · {totalRooms} phòng · {totalShowtimes} suất chiếu hôm nay
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAddShowtimeOpen(true)}
                        className="flex items-center gap-2 h-11 px-5 rounded-lg border border-white/15 bg-white/[0.045] text-sm font-semibold text-gray-300 hover:text-white hover:border-white/30 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm suất chiếu
                    </button>
                    <button className="flex items-center gap-2 h-11 px-6 rounded-lg bg-red-main text-sm font-semibold text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:bg-red-main/90 hover:shadow-[0_4px_28px_rgba(229,9,20,0.5)] active:scale-95 transition">
                        <Plus className="w-4 h-4" />
                        Thêm rạp
                    </button>
                </div>
            </div>

            {/* Data card — filter + meta + bảng gộp một khối */}
            <div className="rounded-lg bg-white/[0.045] border border-white/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-white/10">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm theo tên rạp, địa chỉ hoặc phim..."
                    className="flex-1 min-w-64 bg-black/40 border border-white/10 rounded-lg px-5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-red-main/50 transition"
                />
                <Select value={cinemaFilter} onValueChange={setCinemaFilter}>
                    <SelectTrigger className="w-56">
                        <SelectValue placeholder="Tất cả rạp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả rạp</SelectItem>
                        {cinemas.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={movieFilter} onValueChange={setMovieFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Tất cả phim" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả phim</SelectItem>
                        {allMovies.map((m) => (
                            <SelectItem key={m} value={m}>
                                {m}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Mọi trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Mọi trạng thái</SelectItem>
                        <SelectItem value="Đang bán">Đang bán</SelectItem>
                        <SelectItem value="Gần đầy">Gần đầy</SelectItem>
                        <SelectItem value="Hết vé">Hết vé</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Cinema rows — click để mở modal chi tiết */}
            <div className="divide-y divide-white/5">
                {visibleCinemas.map((cinema) => {
                    const showtimeCount = cinema.rooms.reduce((s, r) => s + r.showtimes.length, 0);
                    const movieCount = new Set(cinema.rooms.flatMap((r) => r.showtimes.map((s) => s.movie))).size;

                    return (
                        <button
                            key={cinema.id}
                            onClick={() => setOpenCinemaId(cinema.id)}
                            className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/[0.03] transition group"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate group-hover:text-red-main transition">
                                    {cinema.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{cinema.address}</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-xs">
                                <span className="px-3 py-1 rounded-lg bg-white/10 text-gray-300">
                                    {cinema.rooms.length} phòng
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-white/10 text-gray-300">
                                    {showtimeCount} suất
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-red-main/15 text-red-main">
                                    {movieCount} phim
                                </span>
                            </div>
                            <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-red-main transition">
                                Xem lịch chiếu
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                    />
                                </svg>
                            </span>
                        </button>
                    );
                })}
                {visibleCinemas.length === 0 && (
                    <p className="py-16 text-center text-gray-500">Không tìm thấy rạp hoặc suất chiếu phù hợp.</p>
                )}
            </div>

            {/* Meta row — số kết quả + legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-white/10 text-xs">
                <p className="text-gray-500">
                    Hiển thị <span className="text-white font-semibold">{visibleCinemas.length}</span> /{' '}
                    {cinemas.length} rạp
                </p>
                <div className="flex items-center gap-4 text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-lg bg-emerald-400"></span> Đang bán
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-lg bg-amber-400"></span> Gần đầy
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-lg bg-red-main"></span> Hết vé
                    </span>
                </div>
            </div>
            </div>

            {/* Modal chi tiết rạp */}
            {openCinema && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-8"
                    onClick={() => setOpenCinemaId(null)}
                >
                    <div
                        className="w-full max-w-5xl max-h-[85vh] flex flex-col rounded-lg bg-[#1b1b1b] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.7)] animate-scaleUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/10">
                            <div className="min-w-0">
                                <h2 className="text-xl font-bold text-white truncate">{openCinema.name}</h2>
                                <p className="mt-0.5 text-sm text-gray-500 truncate">{openCinema.address}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-gray-300">
                                        {openCinema.rooms.length} phòng
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-gray-300">
                                        {openCinema.rooms.reduce((s, r) => s + r.showtimes.length, 0)} suất chiếu
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-red-main/15 text-red-main">
                                        {
                                            new Set(
                                                openCinema.rooms.flatMap((r) => r.showtimes.map((s) => s.movie)),
                                            ).size
                                        }{' '}
                                        phim đang chiếu
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpenCinemaId(null)}
                                className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                                aria-label="Đóng"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal body — rooms schedule */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                            {openCinema.rooms.map((room) => {
                                const grouped = room.showtimes.reduce<Record<string, Showtime[]>>((acc, st) => {
                                    (acc[st.movie] ??= []).push(st);
                                    return acc;
                                }, {});
                                const movies = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

                                return (
                                    <div
                                        key={room.id}
                                        className="rounded-lg border border-white/10 bg-black/30 p-5"
                                    >
                                        {/* Room info */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="text-sm font-semibold text-white">{room.name}</h3>
                                                <span
                                                    className={cn(
                                                        'px-2 py-0.5 rounded-lg border text-[11px] font-bold',
                                                        FORMAT_COLOR[room.format],
                                                    )}
                                                >
                                                    {room.format}
                                                </span>
                                                <span className="text-xs text-gray-500">{room.seats} ghế</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() =>
                                                        setSeatMapTarget({ cinemaId: openCinema.id, roomId: room.id })
                                                    }
                                                    className="text-xs font-medium text-gray-400 hover:text-red-main transition"
                                                >
                                                    Sơ đồ ghế
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setAddShowtimePrefill({
                                                            cinemaId: openCinema.id,
                                                            roomId: room.id,
                                                        });
                                                        setAddShowtimeOpen(true);
                                                    }}
                                                    className="text-xs font-medium text-gray-400 hover:text-red-main transition"
                                                >
                                                    + Thêm suất chiếu
                                                </button>
                                            </div>
                                        </div>

                                        {/* Showtimes grouped by movie */}
                                        <div className="space-y-3">
                                            {movies.map(([movie, showtimes]) => (
                                                <div key={movie} className="flex items-center gap-4">
                                                    <p className="w-56 shrink-0 truncate text-sm font-medium text-gray-300">
                                                        {movie}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {showtimes
                                                            .slice()
                                                            .sort((a, b) => a.time.localeCompare(b.time))
                                                            .map((st) => (
                                                                <span
                                                                    key={st.id}
                                                                    className={cn(
                                                                        'group/chip flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold cursor-pointer transition hover:brightness-125',
                                                                        SHOWTIME_STATUS_COLOR[st.status],
                                                                    )}
                                                                    title={st.status}
                                                                >
                                                                    {st.time}
                                                                    <span className="hidden group-hover/chip:inline text-[10px] opacity-60">
                                                                        ✕
                                                                    </span>
                                                                </span>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {movies.length === 0 && (
                                                <p className="text-sm text-gray-600">Không có suất chiếu phù hợp.</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            {/* Modal thêm suất chiếu theo lô */}
            {addShowtimeOpen && (
                <AddShowtimeModal
                    cinemas={cinemas}
                    movies={allMovies}
                    defaultCinemaId={addShowtimePrefill.cinemaId}
                    defaultRoomId={addShowtimePrefill.roomId}
                    onClose={() => {
                        setAddShowtimeOpen(false);
                        setAddShowtimePrefill({});
                    }}
                    onSubmit={handleAddShowtimes}
                />
            )}

            {/* Seat map editor modal */}
            {seatMapTarget && (
                <SeatMapEditor
                    cinemaName={cinemas.find((c) => c.id === seatMapTarget.cinemaId)?.name ?? ''}
                    roomName={
                        cinemas
                            .find((c) => c.id === seatMapTarget.cinemaId)
                            ?.rooms.find((r) => r.id === seatMapTarget.roomId)?.name ?? ''
                    }
                    roomFormat={
                        cinemas
                            .find((c) => c.id === seatMapTarget.cinemaId)
                            ?.rooms.find((r) => r.id === seatMapTarget.roomId)?.format ?? '2D'
                    }
                    layout={
                        cinemas
                            .find((c) => c.id === seatMapTarget.cinemaId)
                            ?.rooms.find((r) => r.id === seatMapTarget.roomId)?.layout
                    }
                    onClose={() => setSeatMapTarget(null)}
                    onSave={(layout) => handleSaveSeatMap(seatMapTarget.cinemaId, seatMapTarget.roomId, layout)}
                />
            )}
        </div>
    );
};

interface AddShowtimeModalProps {
    cinemas: Cinema[];
    movies: string[];
    defaultCinemaId?: string;
    defaultRoomId?: string;
    onClose: () => void;
    onSubmit: (cinemaId: string, roomIds: string[], movie: string, times: string[]) => void;
}

const AddShowtimeModal: React.FC<AddShowtimeModalProps> = ({
    cinemas,
    movies,
    defaultCinemaId,
    defaultRoomId,
    onClose,
    onSubmit,
}) => {
    const [movie, setMovie] = useState(movies[0] ?? '');
    const [cinemaId, setCinemaId] = useState(defaultCinemaId ?? cinemas[0]?.id ?? '');
    const [roomIds, setRoomIds] = useState<string[]>(defaultRoomId ? [defaultRoomId] : []);
    const [times, setTimes] = useState<string[]>([]);
    const [customTime, setCustomTime] = useState('');

    const rooms = cinemas.find((c) => c.id === cinemaId)?.rooms ?? [];
    const count = roomIds.length * times.length;
    const canSubmit = !!movie && roomIds.length > 0 && times.length > 0;

    const toggleRoom = (id: string) =>
        setRoomIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
    const toggleTime = (t: string) =>
        setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()));
    const addCustomTime = () => {
        if (customTime && !times.includes(customTime)) setTimes((prev) => [...prev, customTime].sort());
        setCustomTime('');
    };

    const chipClass = (active: boolean) =>
        cn(
            'px-3 py-1.5 rounded-lg border text-sm font-semibold transition cursor-pointer',
            active
                ? 'bg-red-main border-red-main text-white'
                : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30',
        );

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-lg bg-[#1b1b1b] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.7)] animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">Thêm suất chiếu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                        aria-label="Đóng"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Phim */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Phim
                        </label>
                        <Select value={movie} onValueChange={setMovie}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn phim" />
                            </SelectTrigger>
                            <SelectContent>
                                {movies.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rạp */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Rạp
                        </label>
                        <Select value={cinemaId} onValueChange={(v) => { setCinemaId(v); setRoomIds([]); }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn rạp" />
                            </SelectTrigger>
                            <SelectContent>
                                {cinemas.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phòng — multi select */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Phòng chiếu{' '}
                            <span className="text-gray-600 normal-case font-normal">
                                (chọn nhiều phòng cùng lúc)
                            </span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {rooms.map((room) => (
                                <button
                                    key={room.id}
                                    type="button"
                                    onClick={() => toggleRoom(room.id)}
                                    className={chipClass(roomIds.includes(room.id))}
                                >
                                    {room.name} · {room.format}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Giờ chiếu — multi select */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Khung giờ{' '}
                            <span className="text-gray-600 normal-case font-normal">
                                (chọn nhiều giờ)
                            </span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TIME_PRESETS.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => toggleTime(t)}
                                    className={chipClass(times.includes(t))}
                                >
                                    {t}
                                </button>
                            ))}
                            {times
                                .filter((t) => !TIME_PRESETS.includes(t))
                                .map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => toggleTime(t)}
                                        className={chipClass(true)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            <input
                                type="time"
                                value={customTime}
                                onChange={(e) => setCustomTime(e.target.value)}
                                onBlur={addCustomTime}
                                className="px-3 py-1.5 rounded-lg border border-dashed border-white/20 bg-black/40 text-sm text-white outline-none focus:border-red-main/50 transition [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-sm">
                        {canSubmit ? (
                            <p className="text-gray-300">
                                Sẽ tạo <span className="font-bold text-red-main">{count}</span> suất chiếu cho{' '}
                                <span className="text-white font-medium">{movie}</span> ·{' '}
                                {roomIds.length} phòng × {times.length} giờ
                            </p>
                        ) : (
                            <p className="text-gray-600">Chọn phòng và khung giờ để xem trước.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="h-10 px-5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition"
                    >
                        Hủy
                    </button>
                    <button
                        disabled={!canSubmit}
                        onClick={() => onSubmit(cinemaId, roomIds, movie, times)}
                        className="flex items-center gap-2 h-10 px-6 rounded-lg bg-red-main text-sm font-semibold text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:bg-red-main/90 active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo {count > 0 ? `${count} ` : ''}suất chiếu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CinemasSection;
