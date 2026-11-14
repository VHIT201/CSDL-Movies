import React, { useMemo, useState } from 'react';
import { cn } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, LayoutGrid, Trash2, X, Check, Banknote, Pencil, Wrench } from 'lucide-react';
import SeatMapEditor, { SeatLayout } from './SeatMapEditor';
import { useCinemaStore, Cinema, Room, TicketPrices, SeatPriceTier } from '@/store/cinemaStore';

const FORMAT_COLOR: Record<Room['format'], string> = {
    IMAX: 'bg-red-main/15 text-red-main border-red-main/30',
    '3D': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    '2D': 'bg-white/10 text-gray-300 border-white/15',
};

const FORMATS: Room['format'][] = ['2D', '3D', 'IMAX'];

const RoomsSection: React.FC = () => {
    const cinemas = useCinemaStore((s) => s.cinemas);
    const saveSeatMap = useCinemaStore((s) => s.saveSeatMap);
    const addRoom = useCinemaStore((s) => s.addRoom);
    const removeRoom = useCinemaStore((s) => s.removeRoom);
    const defaultPrices = useCinemaStore((s) => s.defaultPrices);
    const formatSurcharge = useCinemaStore((s) => s.formatSurcharge);
    const setDefaultPrices = useCinemaStore((s) => s.setDefaultPrices);
    const setFormatSurcharge = useCinemaStore((s) => s.setFormatSurcharge);
    const setRoomPrices = useCinemaStore((s) => s.setRoomPrices);
    const updateRoom = useCinemaStore((s) => s.updateRoom);
    const toggleRoomStatus = useCinemaStore((s) => s.toggleRoomStatus);

    const [query, setQuery] = useState('');
    const [cinemaFilter, setCinemaFilter] = useState('all');
    const [formatFilter, setFormatFilter] = useState('all');
    const [seatMapTarget, setSeatMapTarget] = useState<{ cinemaId: string; roomId: string } | null>(null);
    const [addRoomOpen, setAddRoomOpen] = useState(false);
    const [priceTarget, setPriceTarget] = useState<{ cinemaId: string; roomId: string } | null>(null);
    const [defaultPriceOpen, setDefaultPriceOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<{ cinemaId: string; room: Room } | null>(null);

    // Flatten rooms với thông tin rạp để render bảng
    const allRooms = useMemo(
        () =>
            cinemas.flatMap((cinema) =>
                cinema.rooms.map((room) => ({ cinema, room })),
            ),
        [cinemas],
    );

    const visibleRooms = useMemo(() => {
        const q = query.trim().toLowerCase();
        return allRooms.filter(({ cinema, room }) => {
            if (cinemaFilter !== 'all' && cinema.id !== cinemaFilter) return false;
            if (formatFilter !== 'all' && room.format !== formatFilter) return false;
            if (q && !room.name.toLowerCase().includes(q) && !cinema.name.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [allRooms, query, cinemaFilter, formatFilter]);

    const targetCinema = seatMapTarget ? cinemas.find((c) => c.id === seatMapTarget.cinemaId) : undefined;
    const targetRoom = targetCinema?.rooms.find((r) => r.id === seatMapTarget?.roomId);
    const priceCinema = priceTarget ? cinemas.find((c) => c.id === priceTarget.cinemaId) : undefined;
    const priceRoom = priceCinema?.rooms.find((r) => r.id === priceTarget?.roomId);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Phòng chiếu</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {allRooms.length} phòng · {cinemas.length} rạp
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDefaultPriceOpen(true)}
                        className="flex items-center gap-2 h-11 px-5 rounded-lg border border-white/15 bg-white/[0.045] text-sm font-semibold text-gray-300 hover:text-white hover:border-white/30 transition"
                    >
                        <Banknote className="w-4 h-4" />
                        Giá mặc định
                    </button>
                    <button
                        onClick={() => setAddRoomOpen(true)}
                        className="flex items-center gap-2 h-11 px-6 rounded-lg bg-red-main text-sm font-semibold text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:bg-red-main/90 hover:shadow-[0_4px_28px_rgba(229,9,20,0.5)] active:scale-95 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm phòng
                    </button>
                </div>
            </div>

            {/* Data card */}
            <div className="rounded-lg bg-white/[0.045] border border-white/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-white/10">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm theo tên phòng hoặc rạp..."
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
                    <Select value={formatFilter} onValueChange={setFormatFilter}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Mọi format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Mọi format</SelectItem>
                            {FORMATS.map((f) => (
                                <SelectItem key={f} value={f}>
                                    {f}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Room rows */}
                <div className="divide-y divide-white/5">
                    {visibleRooms.map(({ cinema, room }) => (
                        <div key={room.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition group">
                            <div className="w-40 shrink-0">
                                <p className="text-white font-semibold truncate">{room.name}</p>
                                <span
                                    className={cn(
                                        'inline-block mt-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold',
                                        FORMAT_COLOR[room.format],
                                    )}
                                >
                                    {room.format}
                                </span>
                                {(room.status ?? 'active') === 'maintenance' && (
                                    <span className="inline-block mt-1 ml-1.5 px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                                        Bảo trì
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-400 truncate">{cinema.name}</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs">
                                <span className="px-3 py-1 rounded-lg bg-white/10 text-gray-300">
                                    {room.layout ? room.seats : `${room.seats}*`} ghế
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-white/10 text-gray-300">
                                    {room.showtimes.length} suất
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                                    từ {(room.prices ?? defaultPrices).standard.toLocaleString('vi-VN')}đ
                                </span>
                                {!room.layout && (
                                    <span className="px-3 py-1 rounded-lg border border-dashed border-amber-500/40 text-amber-400">
                                        Chưa có sơ đồ
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setEditTarget({ cinemaId: cinema.id, room })}
                                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition"
                                    title="Sửa phòng"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => toggleRoomStatus(cinema.id, room.id)}
                                    className={cn(
                                        'p-1.5 rounded-lg transition',
                                        (room.status ?? 'active') === 'maintenance'
                                            ? 'text-amber-400 hover:text-emerald-400 hover:bg-white/10'
                                            : 'text-gray-500 hover:text-amber-400 hover:bg-white/10',
                                    )}
                                    title={(room.status ?? 'active') === 'maintenance' ? 'Mở lại phòng' : 'Chuyển sang bảo trì'}
                                >
                                    <Wrench className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPriceTarget({ cinemaId: cinema.id, roomId: room.id })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-gray-300 hover:text-emerald-400 hover:border-emerald-400/50 transition"
                                >
                                    <Banknote className="w-3.5 h-3.5" />
                                    Giá vé
                                </button>
                                <button
                                    onClick={() => setSeatMapTarget({ cinemaId: cinema.id, roomId: room.id })}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-gray-300 hover:text-red-main hover:border-red-main/50 transition"
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    Sơ đồ ghế
                                </button>
                                <button
                                    onClick={() => removeRoom(cinema.id, room.id)}
                                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-main hover:bg-white/10 transition"
                                    title="Xóa phòng"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {visibleRooms.length === 0 && (
                        <p className="py-16 text-center text-gray-500">Không tìm thấy phòng phù hợp.</p>
                    )}
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/10 text-xs text-gray-500">
                    <p>
                        Hiển thị <span className="text-white font-semibold">{visibleRooms.length}</span> /{' '}
                        {allRooms.length} phòng
                    </p>
                    <p>* Số ghế khai báo tay, chưa dựng sơ đồ</p>
                </div>
            </div>

            {/* Seat map editor */}
            {seatMapTarget && targetCinema && targetRoom && (
                <SeatMapEditor
                    cinemaName={targetCinema.name}
                    roomName={targetRoom.name}
                    roomFormat={targetRoom.format}
                    layout={targetRoom.layout}
                    onClose={() => setSeatMapTarget(null)}
                    onSave={(layout: SeatLayout) => {
                        saveSeatMap(seatMapTarget.cinemaId, seatMapTarget.roomId, layout);
                        setSeatMapTarget(null);
                    }}
                />
            )}

            {/* Modal sửa phòng */}
            {editTarget && (
                <AddRoomModal
                    cinemas={cinemas}
                    editing={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSubmit={(cinemaId, name, format) => {
                        updateRoom(cinemaId, editTarget.room.id, { name, format });
                        setEditTarget(null);
                    }}
                />
            )}

            {/* Modal giá vé theo phòng */}
            {priceTarget && priceCinema && priceRoom && (
                <RoomPriceModal
                    room={priceRoom}
                    cinemaName={priceCinema.name}
                    defaultPrices={defaultPrices}
                    surcharge={formatSurcharge[priceRoom.format]}
                    onClose={() => setPriceTarget(null)}
                    onSubmit={(prices) => {
                        setRoomPrices(priceTarget.cinemaId, priceTarget.roomId, prices);
                        setPriceTarget(null);
                    }}
                />
            )}

            {/* Modal giá mặc định + phụ thu format */}
            {defaultPriceOpen && (
                <DefaultPricesModal
                    prices={defaultPrices}
                    surcharge={formatSurcharge}
                    onClose={() => setDefaultPriceOpen(false)}
                    onSubmit={(prices, surcharge) => {
                        setDefaultPrices(prices);
                        setFormatSurcharge(surcharge);
                        setDefaultPriceOpen(false);
                    }}
                />
            )}

            {/* Modal thêm phòng */}
            {addRoomOpen && (
                <AddRoomModal
                    cinemas={cinemas}
                    onClose={() => setAddRoomOpen(false)}
                    onSubmit={(cinemaId, name, format) => {
                        addRoom(cinemaId, name, format);
                        setAddRoomOpen(false);
                    }}
                />
            )}
        </div>
    );
};

interface AddRoomModalProps {
    cinemas: Cinema[];
    /** Có giá trị = chế độ sửa phòng (khóa đổi rạp, prefill tên/format) */
    editing?: { cinemaId: string; room: Room };
    onClose: () => void;
    onSubmit: (cinemaId: string, name: string, format: Room['format']) => void;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ cinemas, editing, onClose, onSubmit }) => {
    const isEdit = !!editing;
    const [cinemaId, setCinemaId] = useState(editing?.cinemaId ?? cinemas[0]?.id ?? '');
    const [name, setName] = useState(editing?.room.name ?? '');
    const [format, setFormat] = useState<Room['format']>(editing?.room.format ?? '2D');
    const canSubmit = !!cinemaId && name.trim().length > 0;

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-lg bg-[#1b1b1b] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.7)] animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">
                        {isEdit ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-5 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Rạp
                        </label>
                        <Select value={cinemaId} onValueChange={setCinemaId} disabled={isEdit}>
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
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Tên phòng
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="VD: Phòng 4"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-red-main/50 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Format
                        </label>
                        <div className="flex gap-2">
                            {FORMATS.map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFormat(f)}
                                    className={cn(
                                        'px-4 py-2 rounded-lg border text-sm font-semibold transition',
                                        format === f
                                            ? 'bg-red-main border-red-main text-white'
                                            : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30',
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    {!isEdit && (
                        <p className="text-xs text-gray-600">
                            Sau khi tạo, mở "Sơ đồ ghế" để dựng layout ghế và gán hạng vé.
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="h-10 px-5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition"
                    >
                        Hủy
                    </button>
                    <button
                        disabled={!canSubmit}
                        onClick={() => onSubmit(cinemaId, name.trim(), format)}
                        className="flex items-center gap-2 h-10 px-6 rounded-lg bg-red-main text-sm font-semibold text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:bg-red-main/90 active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <Check className="w-4 h-4" />
                        {isEdit ? 'Lưu' : 'Tạo phòng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TIER_LABELS: Record<SeatPriceTier, string> = {
    standard: 'Thường',
    vip: 'VIP',
    couple: 'Ghế đôi',
};

const inputClass =
    'w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-red-main/50 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

interface RoomPriceModalProps {
    room: Room;
    cinemaName: string;
    defaultPrices: TicketPrices;
    surcharge: number;
    onClose: () => void;
    onSubmit: (prices: TicketPrices | undefined) => void;
}

const RoomPriceModal: React.FC<RoomPriceModalProps> = ({
    room,
    cinemaName,
    defaultPrices,
    surcharge,
    onClose,
    onSubmit,
}) => {
    const [useDefault, setUseDefault] = useState(room.prices === undefined);
    const [prices, setPrices] = useState<TicketPrices>(room.prices ?? defaultPrices);

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-lg bg-[#1b1b1b] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.7)] animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-lg font-bold text-white">Giá vé — {room.name}</h2>
                        <p className="text-xs text-gray-500">
                            {cinemaName} · {room.format} · phụ thu +{surcharge.toLocaleString('vi-VN')}đ/vé
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <label className="flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useDefault}
                            onChange={(e) => setUseDefault(e.target.checked)}
                            className="w-4 h-4 accent-red-main"
                        />
                        Dùng giá mặc định của hệ thống
                    </label>
                    {!useDefault && (
                        <div className="space-y-3">
                            {(Object.keys(TIER_LABELS) as SeatPriceTier[]).map((tier) => (
                                <div key={tier} className="flex items-center gap-3">
                                    <span className="w-24 shrink-0 text-sm text-gray-400">{TIER_LABELS[tier]}</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step={5000}
                                        value={prices[tier]}
                                        onChange={(e) =>
                                            setPrices((p) => ({ ...p, [tier]: Math.max(0, Number(e.target.value) || 0) }))
                                        }
                                        className={inputClass}
                                    />
                                    <span className="text-xs text-gray-500">đ</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-gray-600">
                        Giá cuối = giá hạng ghế + phụ thu format. Ghế đôi tính cho cả cặp ghế.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="h-10 px-5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => onSubmit(useDefault ? undefined : prices)}
                        className="flex items-center gap-2 h-10 px-6 rounded-lg bg-red-main text-sm font-semibold text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:bg-red-main/90 active:scale-95 transition"
                    >
                        <Check className="w-4 h-4" />
                        Lưu giá
                    </button>
                </div>
            </div>
        </div>
    );
};

interface DefaultPricesModalProps {
    prices: TicketPrices;
    surcharge: Record<Room['format'], number>;
    onClose: () => void;
    onSubmit: (prices: TicketPrices, surcharge: Record<Room['format'], number>) => void;
}

const DefaultPricesModal: React.FC<DefaultPricesModalProps> = ({ prices, surcharge, onClose, onSubmit }) => {
    const [p, setP] = useState<TicketPrices>(prices);
    const [s, setS] = useState(surcharge);

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-lg bg-[#1b1b1b] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.7)] animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-lg font-bold text-white">Giá vé mặc định</h2>
                        <p className="text-xs text-gray-500">Áp cho mọi phòng không cài giá riêng</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 py-5 space-y-5">
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Giá theo hạng ghế
                        </p>
                        {(Object.keys(TIER_LABELS) as SeatPriceTier[]).map((tier) => (
                            <div key={tier} className="flex items-center gap-3">
                                <span className="w-24 shrink-0 text-sm text-gray-400">{TIER_LABELS[tier]}</span>
                                <input
                                    type="number"
                                    min={0}
                                    step={5000}
                                    value={p[tier]}
                                    onChange={(e) =>
                                        setP((prev) => ({ ...prev, [tier]: Math.max(0, Number(e.target.value) || 0) }))
                                    }
                                    className={inputClass}
                                />
                                <span className="text-xs text-gray-500">đ</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Phụ thu theo format
                        </p>
                        {(['2D', '3D', 'IMAX'] as Room['format'][]).map((f) => (
                            <div key={f} className="flex items-center gap-3">
                                <span className="w-24 shrink-0 text-sm text-gray-400">{f}</span>
                                <input
                                    type="number"
                                    min={0}
                                    step={5000}
                                    value={s[f]}
                                    onChange={(e) =>
                                        setS((prev) => ({ ...prev, [f]: Math.max(0, Number(e.target.value) || 0) }))
                                    }
                                    className={inputClass}
                                />
                                <span className="text-xs text-gray-500">đ</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="h-10 px-5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => onSubmit(p, s)}
                        className="flex items-center gap-2 h-10 px-6 rounded-lg bg-red-main text-sm font-semibold text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:bg-red-main/90 active:scale-95 transition"
                    >
                        <Check className="w-4 h-4" />
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomsSection;
