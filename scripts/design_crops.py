"""Cut the cake photos out of the designer's PDF (pages exported as 2880px images).
Badges and heart buttons baked into the mock-up are removed (inpainted from the plain pink backdrop),
because the site draws its own. Coordinates are in a 1000px-wide page space.
Usage: python3 scripts/design_crops.py page1.jpg page2.jpg page3.jpg out_dir"""
import sys
import cv2
import numpy as np

S = 2.88
p1, p2, p3, out = sys.argv[1:5]
pages = {1: cv2.imread(p1), 2: cv2.imread(p2), 3: cv2.imread(p3)}

# name: (page, x0, y0, x1, y1, [rects to remove in the same 1000px space])
CROPS = {
    "raspberry": (1, 121, 880, 371, 1228, [(128, 889, 192, 915), (329, 886, 365, 922)]),
    "blueberry": (1, 639, 880, 879, 1060, [(648, 889, 684, 915), (838, 886, 874, 922)]),
    "mango": (2, 121, 96, 361, 276, [(320, 102, 356, 138)]),
    "pineapple": (2, 380, 96, 620, 276, [(579, 102, 615, 138)]),
    "blackforest": (2, 639, 96, 879, 276, [(648, 105, 700, 130), (838, 102, 874, 138)]),
    "redvelvet": (2, 121, 459, 361, 639, [(320, 465, 356, 501)]),
    "strawberry": (2, 380, 459, 620, 639, [(388, 468, 454, 494), (579, 465, 615, 501)]),
    "hazelnut": (2, 639, 459, 879, 639, [(838, 465, 874, 501)]),
    "kitchen": (3, 70, 105, 490, 440, []),
}
INSET = 12  # trims the mock-up's rounded corners

for name, (pg, x0, y0, x1, y1, holes) in CROPS.items():
    im = pages[pg]
    mask = np.zeros(im.shape[:2], np.uint8)
    for hx0, hy0, hx1, hy1 in holes:
        cv2.rectangle(mask, (int(hx0 * S), int(hy0 * S)), (int(hx1 * S), int(hy1 * S)), 255, -1)
    fixed = cv2.inpaint(im, mask, 9, cv2.INPAINT_TELEA) if holes else im
    a, b = int(x0 * S) + INSET, int(y0 * S) + INSET
    c, d = int(x1 * S) - INSET, int(y1 * S) - (INSET if name != "raspberry" else 2)
    crop = fixed[b:d, a:c]
    cv2.imwrite(f"{out}/{name}.webp", crop, [cv2.IMWRITE_WEBP_QUALITY, 92])
    print(name, crop.shape)
