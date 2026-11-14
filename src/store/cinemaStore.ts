import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SeatLayout } from '../pages/Admin/components/SeatMapEditor';
import { countSeats } from '../pages/Admin/components/SeatMapEditor';

// Types
export interface Showtime {
    id: string;
    movie: string;
    time: string;
    status: 'Đang bán' | 'Gần đầy' | 'Hết vé';
}

export type SeatPriceTier = 'standard' | 'vip' | 'couple';
export type TicketPrices = Record<SeatPriceTier, number>;

export interface Room {
    id: string;
    name: string;
    format: '2D' | '3D' | 'IMAX';
    seats: number;
    layout?: SeatLayout;
    prices?: TicketPrices;
    /** Mặc định coi là 'active' khi chưa set */
    status?: 'active' | 'maintenance';
    showtimes: Showtime[];
}

export interface Cinema {
    id: string;
    name: string;
    address: string;
    rooms: Room[];
}

// Mock data — sau này thay bằng API/backend
const INITIAL_CINEMAS: Cinema[] = [
    {
        id: 'cinema-01',
        name: 'theMovies Nguyễn Du',
        address: '116 Nguyễn Du, Quận 1, TP.HCM',
        rooms: [
            {
                id: 'r1',
                name: 'Phòng 1',
                format: 'IMAX',
                seats: 220,
                showtimes: [
                    { id: 'st1', movie: 'Gladiator II', time: '14:00', status: 'Đang bán' },
                    { id: 'st2', movie: 'Gladiator II', time: '17:30', status: 'Gần đầy' },
                    { id: 'st3', movie: 'Deadpool & Wolverine', time: '21:00', status: 'Hết vé' },
                ],
            },
            {
                id: 'r2',
                name: 'Phòng 2',
                format: '2D',
                seats: 120,
                showtimes: [
                    { id: 'st4', movie: 'Moana 2', time: '13:30', status: 'Đang bán' },
                    { id: 'st5', movie: 'Moana 2', time: '16:00', status: 'Đang bán' },
                    { id: 'st6', movie: 'Wicked', time: '19:00', status: 'Gần đầy' },
                ],
            },
            {
                id: 'r3',
                name: 'Phòng 3',
                format: '3D',
                seats: 150,
                showtimes: [
                    { id: 'st7', movie: 'Venom: The Last Dance', time: '15:15', status: 'Đang bán' },
                    { id: 'st8', movie: 'Red One', time: '18:45', status: 'Đang bán' },
                ],
            },
        ],
    },
    {
        id: 'cinema-02',
        name: 'theMovies Quang Trung',
        address: '304 Quang Trung, Gò Vấp, TP.HCM',
        rooms: [
            {
                id: 'r4',
                name: 'Phòng 1',
                format: '2D',
                seats: 100,
                showtimes: [
                    { id: 'st9', movie: 'Wicked', time: '14:30', status: 'Gần đầy' },
                    { id: 'st10', movie: 'Wicked', time: '17:45', status: 'Đang bán' },
                    { id: 'st11', movie: 'Moana 2', time: '20:30', status: 'Đang bán' },
                ],
            },
            {
                id: 'r5',
                name: 'Phòng 2',
                format: '3D',
                seats: 140,
                showtimes: [
                    { id: 'st12', movie: 'Gladiator II', time: '16:15', status: 'Đang bán' },
                    { id: 'st13', movie: 'Deadpool & Wolverine', time: '19:30', status: 'Gần đầy' },
                ],
            },
        ],
    },
    {
        id: 'cinema-03',
        name: 'theMovies Hà Nội Center',
        address: '25 Bà Triệu, Hoàn Kiếm, Hà Nội',
        rooms: [
            {
                id: 'r6',
                name: 'Phòng 1',
                format: 'IMAX',
                seats: 250,
                showtimes: [
                    { id: 'st14', movie: 'Deadpool & Wolverine', time: '15:00', status: 'Gần đầy' },
                    { id: 'st15', movie: 'Gladiator II', time: '18:30', status: 'Đang bán' },
                    { id: 'st16', movie: 'Gladiator II', time: '21:45', status: 'Đang bán' },
                ],
            },
            {
                id: 'r7',
                name: 'Phòng 2',
                format: '2D',
                seats: 90,
                showtimes: [{ id: 'st17', movie: 'Red One', time: '19:15', status: 'Đang bán' }],
            },
        ],
    },
];

const DEFAULT_PRICES: TicketPrices = { standard: 80000, vip: 120000, couple: 180000 };
const DEFAULT_FORMAT_SURCHARGE: Record<Room['format'], number> = {
    '2D': 0,
    '3D': 20000,
    IMAX: 50000,
};

interface CinemaStore {
    cinemas: Cinema[];
    /** Giá mặc định theo hạng ghế (áp cho phòng không override) */
    defaultPrices: TicketPrices;
    /** Phụ thu theo format phòng — cộng vào giá hạng ghế */
    formatSurcharge: Record<Room['format'], number>;
    setDefaultPrices: (prices: TicketPrices) => void;
    setFormatSurcharge: (surcharge: Record<Room['format'], number>) => void;
    /** Override giá cho 1 phòng — truyền undefined để về giá mặc định */
    setRoomPrices: (cinemaId: string, roomId: string, prices: TicketPrices | undefined) => void;
    /** Tạo theo lô: phim × nhiều phòng × nhiều giờ — dedupe trùng phim+giờ trong cùng phòng */
    addShowtimes: (cinemaId: string, roomIds: string[], movie: string, times: string[]) => void;
    /** Lưu sơ đồ ghế — số ghế suy ra từ layout (bỏ ô lối đi) */
    saveSeatMap: (cinemaId: string, roomId: string, layout: SeatLayout) => void;
    /** Thêm phòng mới vào rạp */
    addRoom: (cinemaId: string, name: string, format: Room['format']) => void;
    /** Sửa tên/format phòng */
    updateRoom: (cinemaId: string, roomId: string, updates: { name?: string; format?: Room['format'] }) => void;
    /** Bật/tắt trạng thái bảo trì cho phòng */
    toggleRoomStatus: (cinemaId: string, roomId: string) => void;
    /** Xóa phòng khỏi rạp */
    removeRoom: (cinemaId: string, roomId: string) => void;
}

export const useCinemaStore = create<CinemaStore>()(
    persist(
        (set) => ({
            cinemas: INITIAL_CINEMAS,
            defaultPrices: DEFAULT_PRICES,
            formatSurcharge: DEFAULT_FORMAT_SURCHARGE,

            setDefaultPrices: (prices) => set({ defaultPrices: prices }),

            setFormatSurcharge: (surcharge) => set({ formatSurcharge: surcharge }),

            setRoomPrices: (cinemaId, roomId, prices) =>
                set((state) => ({
                    cinemas: state.cinemas.map((cinema) =>
                        cinema.id !== cinemaId
                            ? cinema
                            : {
                                  ...cinema,
                                  rooms: cinema.rooms.map((room) =>
                                      room.id === roomId ? { ...room, prices } : room,
                                  ),
                              },
                    ),
                })),

            addShowtimes: (cinemaId, roomIds, movie, times) =>
                set((state) => ({
                    cinemas: state.cinemas.map((cinema) =>
                        cinema.id !== cinemaId
                            ? cinema
                            : {
                                  ...cinema,
                                  rooms: cinema.rooms.map((room) =>
                                      roomIds.includes(room.id)
                                          ? {
                                                ...room,
                                                showtimes: [
                                                    ...room.showtimes,
                                                    ...times
                                                        .filter(
                                                            (t) =>
                                                                !room.showtimes.some(
                                                                    (s) => s.movie === movie && s.time === t,
                                                                ),
                                                        )
                                                        .map((t, i) => ({
                                                            id: `st-${Date.now()}-${room.id}-${i}`,
                                                            movie,
                                                            time: t,
                                                            status: 'Đang bán' as const,
                                                        })),
                                                ],
                                            }
                                          : room,
                                  ),
                              },
                    ),
                })),

            saveSeatMap: (cinemaId, roomId, layout) =>
                set((state) => ({
                    cinemas: state.cinemas.map((cinema) =>
                        cinema.id !== cinemaId
                            ? cinema
                            : {
                                  ...cinema,
                                  rooms: cinema.rooms.map((room) =>
                                      room.id === roomId
                                          ? { ...room, layout, seats: countSeats(layout) }
                                          : room,
                                  ),
                              },
                    ),
                })),

            addRoom: (cinemaId, name, format) =>
                set((state) => ({
                    cinemas: state.cinemas.map((cinema) =>
                        cinema.id !== cinemaId
                            ? cinema
                            : {
                                  ...cinema,
                                  rooms: [
                                      ...cinema.rooms,
                                      {
                                          id: `r-${Date.now()}`,
                                          name,
                                          format,
                                          seats: 0,
                                          status: 'active',
                                          showtimes: [],
                                      },
                                  ],
                              },
                    ),
                })),

            updateRoom: (cinemaId, roomId, updates) =>
                set((state) => ({
                    cinemas: state.cinemas.map((cinema) =>
                        cinema.id !== cinemaId
                            ? cinema
                            : {
                                  ...cinema,
                                  rooms: cinema.rooms.map((room) =>
                                      room.id === roomId ? { ...room, ...updates } : room,
                                  ),
                              },
                    ),
                })),

            toggleRoomStatus: (cinemaId, roomId) =>
                set((state) => ({
                    cinemas: state.cinemas.map((cinema) =>
                        cinema.id !== cinemaId
                            ? cinema
                            : {
                                  ...cinema,
                                  rooms: cinema.rooms.map((room) =>
                                      room.id === roomId
                                          ? {
                                                ...room,
                                                status:
                                                    (room.status ?? 'active') === 'maintenance'
                                                        ? 'active'
                                                        : 'maintenance',
                                            }
                                          : room,
                                  ),
                              },
                    ),
                })),

            removeRoom: (cinemaId, roomId) =>
                set((state) => ({
                    cinemas: state.cinemas.map((cinema) =>
                        cinema.id !== cinemaId
                            ? cinema
                            : { ...cinema, rooms: cinema.rooms.filter((room) => room.id !== roomId) },
                    ),
                })),
        }),
        { name: 'cinema-storage' },
    ),
);
