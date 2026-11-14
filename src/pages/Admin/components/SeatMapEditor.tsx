import React, { useMemo, useState } from 'react';
import { cn } from '@/utils';
import { Check, X } from 'lucide-react';

export type SeatTier = 'standard' | 'vip' | 'couple' | 'empty';

export interface SeatLayout {
    rows: number;
    cols: number;
    seats: SeatTier[][];
}

const TIERS: { key: SeatTier; label: string; seatClass: string; brushClass: string }[] = [
    {
        key: 'standard',
        label: 'Thường',
        seatClass: 'bg-white/10 border-white/25 text-gray-200 hover:border-white/60',
        brushClass: 'bg-white/10 border-white/25',
    },
    {
        key: 'vip',
        label: 'VIP',
        seatClass: 'bg-red-main/30 border-red-main/70 text-red-200 hover:border-red-main',
        brushClass: 'bg-red-main/30 border-red-main',
    },
    {
        key: 'couple',
        label: 'Ghế đôi',
        seatClass: 'bg-violet-500/30 border-violet-400/70 text-violet-200 hover:border-violet-300',
        brushClass: 'bg-violet-500/30 border-violet-400',
    },
    {
        key: 'empty',
        label: 'Lối đi',
        seatClass: 'bg-transparent border-dashed border-white/10 hover:border-white/30',
        brushClass: 'bg-transparent border-dashed border-white/20',
    },
];

const TIER_LABEL: Record<SeatTier, string> = {
    standard: 'Thường',
    vip: 'VIP',
    couple: 'Ghế đôi',
    empty: 'Lối đi',
};

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const buildGrid = (rows: number, cols: number, source?: SeatTier[][]): SeatTier[][] =>
    Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => source?.[r]?.[c] ?? 'standard'),
    );

export const countSeats = (layout: SeatLayout): number =>
    layout.seats.flat().filter((s) => s !== 'empty').length;

interface SeatMapEditorProps {
    cinemaName: string;
    roomName: string;
    roomFormat: string;
    layout?: SeatLayout;
    onClose: () => void;
    onSave: (layout: SeatLayout) => void;
}

const SeatMapEditor: React.FC<SeatMapEditorProps> = ({
    cinemaName,
    roomName,
    roomFormat,
    layout,
    onClose,
    onSave,
}) => {
    const [rows, setRows] = useState(layout?.rows ?? 8);
    const [cols, setCols] = useState(layout?.cols ?? 12);
    const [seats, setSeats] = useState<SeatTier[][]>(() =>
        buildGrid(layout?.rows ?? 8, layout?.cols ?? 12, layout?.seats),
    );
    const [activeTier, setActiveTier] = useState<SeatTier>('standard');
    const [painting, setPainting] = useState(false);
    const [aisleCol, setAisleCol] = useState(0);
    const [aisleRow, setAisleRow] = useState(0);

    const counts = useMemo(() => {
        const c: Record<SeatTier, number> = { standard: 0, vip: 0, couple: 0, empty: 0 };
        seats.flat().forEach((s) => c[s]++);
        return c;
    }, [seats]);

    const paintCell = (r: number, c: number) => {
        setSeats((prev) => {
            const next = prev.map((row) => [...row]);
            next[r][c] = activeTier;
            return next;
        });
    };

    const paintRow = (r: number) =>
        setSeats((prev) => prev.map((row, i) => (i === r ? row.map(() => activeTier) : row)));

    const paintCol = (c: number) =>
        setSeats((prev) => prev.map((row) => row.map((cell, i) => (i === c ? activeTier : cell))));

    const applyGridSize = () => setSeats((prev) => buildGrid(rows, cols, prev));

    // Chiều rộng thực tế = hàng dài nhất (hỗ trợ hàng ngắn/dài khác nhau)
    const maxCols = Math.max(1, ...seats.map((r) => r.length));

    // Preset bố cục nhanh: đều / chia đôi / chia ba / quạt (hàng trước hẹp)
    const applyPreset = (preset: 'uniform' | 'split2' | 'split3' | 'fan') => {
        let next = buildGrid(rows, cols);
        if (preset === 'split2' || preset === 'split3') {
            const aisles =
                preset === 'split2'
                    ? [Math.floor(cols / 2)]
                    : [Math.floor(cols / 3), Math.floor((2 * cols) / 3)];
            next = next.map((row) => row.map((cell, i) => (aisles.includes(i) ? 'empty' : cell)));
        } else if (preset === 'fan') {
            next = next.map((row, r) => {
                const t = r / Math.max(1, rows - 1);
                const shrink = Math.round((1 - t) * 4);
                return [
                    ...Array<SeatTier>(shrink).fill('empty'),
                    ...row.slice(shrink, cols - shrink),
                    ...Array<SeatTier>(shrink).fill('empty'),
                ];
            });
        }
        setSeats(next);
        setRows(next.length);
        setCols(Math.max(...next.map((r) => r.length)));
    };

    // Chèn lối đi dọc (cột trống) / ngang (hàng trống) tại vị trí
    const insertAisleCol = (index: number) => {
        setSeats((prev) => prev.map((row) => [...row.slice(0, index), 'empty', ...row.slice(index)]));
        setCols((c) => c + 1);
    };
    const insertAisleRow = (index: number) => {
        setSeats((prev) => {
            const width = Math.max(...prev.map((r) => r.length));
            return [...prev.slice(0, index), Array<SeatTier>(width).fill('empty'), ...prev.slice(index)];
        });
        setRows((r) => r + 1);
    };

    // Tăng/giảm ghế cho từng hàng (hàng khác độ dài — quạt, hàng đôi cuối...)
    const trimRow = (r: number) =>
        setSeats((prev) => prev.map((row, i) => (i === r && row.length > 1 ? row.slice(0, -1) : row)));
    const extendRow = (r: number) =>
        setSeats((prev) => prev.map((row, i) => (i === r ? [...row, 'standard'] : row)));

    const seatCellClass = (tier: SeatTier) =>
        cn(
            'w-7 h-7 rounded-md border text-[9px] font-bold flex items-center justify-center transition select-none cursor-pointer',
            TIERS.find((t) => t.key === tier)?.seatClass,
        );

    return (
        <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg bg-[#1b1b1b] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.7)] animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-lg font-bold text-white">Sơ đồ ghế — {roomName}</h2>
                        <p className="text-xs text-gray-500">
                            {cinemaName} · {roomFormat}
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

                {/* Toolbar: kích thước + brush hạng ghế */}
                <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kích thước</span>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={rows}
                            onChange={(e) => setRows(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                            className="w-14 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center outline-none focus:border-red-main/50"
                        />
                        <span className="text-gray-500 text-xs">hàng ×</span>
                        <input
                            type="number"
                            min={1}
                            max={30}
                            value={cols}
                            onChange={(e) => setCols(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                            className="w-14 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center outline-none focus:border-red-main/50"
                        />
                        <span className="text-gray-500 text-xs">cột</span>
                        <button
                            onClick={applyGridSize}
                            className="ml-1 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/30 transition"
                        >
                            Áp dụng
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hạng ghế</span>
                        {TIERS.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTier(t.key)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition',
                                    activeTier === t.key
                                        ? 'bg-white text-black border-white'
                                        : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30',
                                )}
                            >
                                <span className={cn('w-3 h-3 rounded border', t.brushClass)} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bố cục</span>
                        {(
                            [
                                ['uniform', 'Đều'],
                                ['split2', 'Chia đôi'],
                                ['split3', 'Chia ba'],
                                ['fan', 'Quạt'],
                            ] as const
                        ).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => applyPreset(key)}
                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/30 transition"
                            >
                                {label}
                            </button>
                        ))}
                        <span className="text-gray-700">|</span>
                        <input
                            type="number"
                            min={0}
                            max={cols}
                            value={aisleCol}
                            onChange={(e) => setAisleCol(Math.max(0, Math.min(cols, Number(e.target.value) || 0)))}
                            title="Vị trí cột"
                            className="w-12 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-red-main/50"
                        />
                        <button
                            onClick={() => insertAisleCol(aisleCol)}
                            className="px-2.5 py-1.5 rounded-lg border border-dashed border-white/20 text-xs font-semibold text-gray-400 hover:text-red-main hover:border-red-main/50 transition"
                        >
                            + Lối dọc
                        </button>
                        <input
                            type="number"
                            min={0}
                            max={rows}
                            value={aisleRow}
                            onChange={(e) => setAisleRow(Math.max(0, Math.min(rows, Number(e.target.value) || 0)))}
                            title="Vị trí hàng"
                            className="w-12 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none focus:border-red-main/50"
                        />
                        <button
                            onClick={() => insertAisleRow(aisleRow)}
                            className="px-2.5 py-1.5 rounded-lg border border-dashed border-white/20 text-xs font-semibold text-gray-400 hover:text-red-main hover:border-red-main/50 transition"
                        >
                            + Lối ngang
                        </button>
                    </div>
                </div>

                {/* Seat grid */}
                <div className="flex-1 overflow-auto px-6 py-5 text-center">
                    {/* Màn hình */}
                    <div className="mx-auto mb-6 w-3/4 max-w-md">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-red-main/80 to-transparent" />
                        <p className="mt-2 text-center text-[10px] font-bold tracking-[0.3em] text-gray-500">
                            MÀN HÌNH
                        </p>
                    </div>

                    <div
                        className="inline-block"
                        onMouseLeave={() => setPainting(false)}
                    >
                        {/* Đang tô */}
                        <p className="mb-3 text-left text-xs text-gray-500">
                            Đang tô:{' '}
                            <span className="font-semibold text-white">{TIER_LABEL[activeTier]}</span> — click hoặc
                            kéo lên ghế để đổi hạng
                        </p>
                        {/* Column labels */}
                        <div className="flex gap-1 mb-1">
                            <div className="w-7 shrink-0" />
                            {Array.from({ length: maxCols }, (_, c) => (
                                <button
                                    key={c}
                                    onClick={() => paintCol(c)}
                                    title={`Tô cả cột ${c + 1}`}
                                    className="w-7 h-5 text-[10px] font-bold text-gray-400 hover:text-red-main transition text-center"
                                >
                                    {c + 1}
                                </button>
                            ))}
                        </div>

                        {seats.map((row, r) => (
                            <div key={r} className="flex gap-1 mb-1">
                                <button
                                    onClick={() => paintRow(r)}
                                    title={`Tô cả hàng ${ROW_LABELS[r] ?? r + 1}`}
                                    className="w-7 h-7 shrink-0 text-[11px] font-bold text-gray-400 hover:text-red-main transition text-center"
                                >
                                    {ROW_LABELS[r] ?? r + 1}
                                </button>
                                {row.map((tier, c) => (
                                    <button
                                        key={c}
                                        onMouseDown={() => {
                                            setPainting(true);
                                            paintCell(r, c);
                                        }}
                                        onMouseEnter={() => painting && paintCell(r, c)}
                                        onMouseUp={() => setPainting(false)}
                                        title={`${ROW_LABELS[r] ?? r + 1}${c + 1} — ${TIER_LABEL[tier]}`}
                                        className={seatCellClass(tier)}
                                    >
                                        {tier !== 'empty' ? c + 1 : ''}
                                    </button>
                                ))}
                                {/* +/- ghế cho hàng */}
                                <div className="flex gap-0.5 ml-1">
                                    <button
                                        onClick={() => trimRow(r)}
                                        title="Bớt ghế cuối hàng"
                                        className="w-5 h-7 text-xs font-bold text-gray-600 hover:text-red-main transition"
                                    >
                                        −
                                    </button>
                                    <button
                                        onClick={() => extendRow(r)}
                                        title="Thêm ghế cuối hàng"
                                        className="w-5 h-7 text-xs font-bold text-gray-600 hover:text-emerald-400 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-gray-600">
                        Chọn hạng ghế rồi click hoặc kéo tô lên ghế. Click chữ hàng (A, B…) hoặc số cột để tô nhanh
                        cả khu. Nút −/+ cuối mỗi hàng để hàng ngắn/dài hơn (quạt, ghế đôi). + Lối dọc/ngang để
                        chia khu như rạp thật.
                    </p>
                </div>

                {/* Footer: summary + actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/10">
                    <div className="flex items-center gap-3 text-xs">
                        {TIERS.map((t) => (
                            <span key={t.key} className="flex items-center gap-1.5 text-gray-400">
                                <span className={cn('w-3 h-3 rounded border', t.brushClass)} />
                                {t.label}: <span className="text-white font-semibold">{counts[t.key]}</span>
                            </span>
                        ))}
                        <span className="text-gray-500">
                            · Tổng <span className="text-white font-semibold">{counts.standard + counts.vip + counts.couple}</span> ghế
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="h-10 px-5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={() => onSave({ rows: seats.length, cols: maxCols, seats })}
                            className="flex items-center gap-2 h-10 px-6 rounded-lg bg-red-main text-sm font-semibold text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:bg-red-main/90 active:scale-95 transition"
                        >
                            <Check className="w-4 h-4" />
                            Lưu sơ đồ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatMapEditor;
