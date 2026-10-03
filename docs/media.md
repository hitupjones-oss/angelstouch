# Media log

All people/lifestyle imagery on the site was generated on **Higgsfield** for this redesign.
Photos of the **buildings, rooms and the painting class are real** Angels Touch photos from the previous site —
generated images are never used to depict the actual residences.

> Treat generated imagery like licensed stock: it illustrates the experience, not specific residents or staff.
> A real photo shoot of the team and (consenting) residents is the natural next upgrade — drop new masters into
> `media-src/` with the same file names and run `npm run media`.

## Pipeline

```
media-src/img/*.png|jpg   →  npm run media -- images  →  public/media/img/<name>-{480,960,1600,2400}.webp
media-src/video/*.mp4     →  npm run media -- videos  →  public/media/video/<name>-{720,1080}.mp4 + -poster.webp
```

Masters are git-ignored (≈215 MB). Re-download them from the Higgsfield library using the job IDs below.
Looping clips get a 1-second cross-dissolve from tail to head so they repeat seamlessly.

## Stills — model `cinematic_studio_2_5` (2K), unless noted

Shared style suffix: *Cinematic editorial photograph, shot on ARRI Alexa 35, shallow depth of field, soft natural window light,
gentle film grain, refined color grade with creamy ivory highlights and soft blue shadows, authentic candid moment, photorealistic, no text.*
Caregivers wear **cornflower-blue scrubs** to echo the brand color.

| Asset | Job ID | Prompt (abridged) |
|---|---|---|
| `film-laugh` | `1cc1fdf2-dd2a-4bea-9891-78dd68fee277` | Close portrait of an 82-year-old woman, silver hair, cream cardigan, laughing joyfully, golden morning rim light |
| `activities-painting` | `29e078d9-e596-4c68-9a05-22b2f748370a` | 78-year-old man in a pale blue apron painting a watercolor at an easel, smiling with quiet pride |
| `activities-crafts` | `1107449e-d0c6-4a6c-90f2-04e4628dc76c` | Two women in their eighties making pastel paper flowers, laughing at a shared joke |
| `care-together` | `13a5b390-50e9-48cf-9fca-44a8ae21e1ca` | Caregiver in blue scrubs kneeling beside a resident in an armchair, holding hands, sharing a laugh |
| `sunrise` | `70fcd3ca-1995-4cb4-85dd-3aa4531f67e6` | Elderly man in a grey cardigan with coffee, smiling at the sunrise from his bedroom window |
| `call-family` | `06dcf162-80b2-4809-bd7e-2f66f0753d55` | Webcam-framed older couple on a sofa, smiling and waving on a video call |
| `call-nurse` | `b02e4446-37d5-484c-8e31-14e2c9ff9c39` | *(gpt_image_2, high)* Webcam-framed cheerful nurse in blue scrubs talking warmly to camera |
| `dining-plated` | `7608987e-c655-4024-bbfc-7766d98ffa8f` | Chef's hands setting down herb-roasted salmon and vegetables before a smiling resident |
| `memory-album` | `cef43293-fb7d-4038-9adc-e47a2bd19656` | *(4:5)* Caregiver and resident looking through a vintage photo album, delighted recognition |
| `careers-team` | `6843cac9-176f-41c8-b196-01b38e09ed1b` | Three caregivers laughing together in a warm, home-like common room (no clinical equipment) |
| `hands` | `05db9470-1ea5-476d-aab3-cc82b7642d80` | Macro of a young hand holding an elderly hand with a gold ring on a knit blanket |
| `activities-piano` | `6894915e-a392-4751-a69f-091cf4b90fce` | Man playing an upright piano while two women sing along |
| `garden` | `7b58ea1b-5a17-426e-944d-120b7aab661a` | Resident in a sunhat and caregiver planting flowers in a raised bed on a patio |
| `dining-friends` | `f793d588-672a-4c49-b108-a60a63fc9dee` | Four friends laughing over a home-cooked lunch at a round table |

## Motion — model `kling3_0`, mode `pro`, sound off, image-to-video from the still above

| Asset | Job ID | Length | Motion direction |
|---|---|---|---|
| `film-laugh` | `0e4545a7-6d32-4645-810d-f772fc3e6fd4` | 5s | Warm laugh, head tilt, very slow push-in |
| `film-painting` | `d75688a0-4b43-44e5-9d61-6ae17cbb09d7` | 5s | Brushstroke, pause, smile; slow lateral dolly |
| `film-crafts` | `9fe2b6ff-1622-47b4-9b8d-bf40ca897f55` | 5s | Shaping petals, shared laughter; slow push-in |
| `film-caregiver` | `ef4a0edd-0597-49fc-9cee-10276003a5f8` | 5s | Shared laugh, gentle squeeze of hands; slow arc |
| `film-sunrise` | `e6e42a1f-76bc-4c2a-9a7e-3675869599c2` | 5s | Sip of coffee, light brightening, dust motes |
| `call-family` | `cc21a60a-3fa9-4014-b90e-0ade7000a2da` | 10s | Locked-off webcam: couple talks, waves, laughs |
| `call-nurse` | `9b1d5a5d-4436-4e80-bf88-c557fd409a67` | 10s | Locked-off webcam: nurse talks, nods, gestures |
| `hands` | `31d14b09-62a4-4c46-b30e-fcd646d86267` | 5s | Thumb stroke and tender squeeze; macro push-in |
| `activities-piano` | `db128c12-a8d0-442c-b97b-bc3bd119e136` | 5s | Playing and singing along, swaying |
| `dining-friends` | `02f0ddd1-8afc-4b22-8c94-65554108370c` | 5s | Story ends in warm laughter around the table |
| `garden` | `96a6785b-6626-4d8c-8104-a833a54a8d4c` | 5s | Planting, patting soil, shared laugh, breeze |
| `careers-team` | `7359b263-e367-4c77-b816-3f122d3ec2b5` | 5s | Colleagues laughing, friendly nudge |
| `dining-plated` | `9357fe0e-3548-4452-9379-b51061c3ed40` | 5s | Plate set down, resident smiles up gratefully |

## The virtual-consultation "Zoom" call

Rather than asking a video model to render a fake meeting UI (which comes out blurry and unreadable),
the call is **composited live in HTML**: two generated webcam clips (`call-nurse`, `call-family`) sit in a
window with a running call timer, speaking indicators that hand off between tiles, and call controls.
It stays crisp at every screen size, and copy/labels can be edited without regenerating video.

## Real photos (from the previous site)

`residence-exterior`, `residence-sign`, `residence-lounge`, `residence-living-room`, `residence-painting-class`,
`residence-gathering`, and the three award badges (`award-2020`, `award-2023`, `award-2025`, trimmed and upscaled 2× for retina).
