# game-of-khe

🎮 **Game of Khe — Limebo Adventure**: game platformer 2D điều khiển nhân vật Limebo (phong cách thú nhồi bông thủ công), xây dựng thuần HTML5 Canvas + JavaScript, không cần thư viện ngoài.

## Chơi ngay

```bash
python3 -m http.server 8321
# mở http://localhost:8321
```

## Điều khiển

| Phím | Hành động |
|---|---|
| `←` `→` / `A` `D` | Di chuyển trái / phải |
| `Space` / `↑` / `W` | Nhảy — nhấn lần 2 khi đang trên không = **nhảy đôi** vượt vật cản cao |
| `J` | Tấn công cận chiến (phá bụi gai, pha lê — +10 điểm) |
| `K` | Phòng thủ (chặn sát thương trong lúc giơ khiên) |
| `L` | **Tung chiêu** — bắn cầu năng lượng xoá vật cản từ xa (hồi chiêu 2,5s) |
| `1–9`, `0` | Emote nhanh |
| Click nút emoji | 14 emote: 😊 😂 😢 😠 😲 😨 😵 😝 📢 💃 🏆 😴 👋 ⏳ |

Trên điện thoại: mở web, xoay ngang — có nút cảm ứng ◀ ▶ / Thủ / Chiêu / Đánh / Nhảy.

## Gameplay

- **12 màn chơi**: Đồng cỏ → Rừng xanh → Bãi biển → Đồi kẹo ngọt → Rừng thu → Làng hoàng hôn → Vườn mây → Ao mưa → Đầm lầy trăng → Phế tích sa mạc → Núi tuyết → Hang pha lê. Đi hết mép phải màn để qua màn kế (+50 điểm), hết màn cuối là chiến thắng 🏆.
- **5 tim**: bụi gai / cụm pha lê / măng đá gây sát thương (kèm knockback + bất tử tạm 1,5s). Hết tim → animation gục ngã & hồi phục.
- **Vũng nước** làm chậm còn 55% tốc độ (đúng manifest).
- **Chướng ngại vật rắn** chặn đường — nhảy qua hoặc nhảy đứng lên trên (physics platformer đầy đủ).

## Cấu trúc

- `index.html` — giao diện, HUD (tim/điểm/tên màn), thanh emote.
- `game.js` — engine: state machine animation theo `game-pack.json` (18 state, frame timing, animation events `hit`/`guard-on`/`speaker-pulse`…), vật lý, va chạm AABB theo collision box của manifest.
- `assets/` — 2 atlas hành động/emote (8×9, cell 192×208, pivot 0.5/0.94), base pet atlas `spritesheet.webp` (8×11 — hàng 2/3 dùng cho chạy phải/trái), spritesheet di chuyển ghép từ GIF preview (idle, nhảy, vẫy tay, chờ), 4 background 1920×1080, 16 chướng ngại vật 512×512.
- `limebo-game-pack/`, `game-pack/`, `environment/` — pack tài nguyên gốc kèm manifest & tài liệu.

## Nguồn tài nguyên

Toàn bộ sprite/background lấy từ **Limebo Game Pack** và **Limebo Environment Pack** (định dạng engine-neutral `limebo-game-pack-v1` / `limebo-environment-pack-v1`); thông số cắt frame, pivot, collision box, hazard, slow-zone đều đọc từ các file manifest JSON đi kèm.
