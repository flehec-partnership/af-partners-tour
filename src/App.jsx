import { useState, useMemo } from "react";

/* ============ DESIGN TOKENS (identical to AssessFirst Embedded tour) ============ */
const AF = {
  pink: "#FF2F92", black: "#1D1D1F", grayMid: "#757575", grayLight: "#F4F4F5", border: "#E6E6E6", white: "#FFFFFF",
  gradient: "linear-gradient(90deg,#FFA800 0%,#FE8058 25%,#FF2F92 50%,#0096FF 75%,#029CAF 100%)",
  font: "'TWK Lausanne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};
const BOOKING_URL = "https://meetings.hubspot.com/flehec";
const PARTNERS_MAIL = "partners@assessfirst.com";

/* AssessFirst product catalogue */
const PRODUCTS = [
  { id: "CVS", label: "CV Screening", short: "CV analysis", cost: 5, icon: "▤", grad: "linear-gradient(135deg,#757575,#1D1D1F)", info: "Automatic parsing · 1 min · Extracts skills, experience and education from every CV and ranks applications against the role." },
  { id: "SCAN", label: "SCAN", short: "AI voice pre-qualification", cost: 10, icon: "◎", grad: "linear-gradient(135deg,#FF2F92,#0096FF)", info: "AI voice agent · 5 min · Calls candidates and validates the key criteria of the role — experience, salary, availability, mobility — with instant fit scoring." },
  { id: "SCANT", label: "SCAN Text", short: "AI text pre-qualification", cost: 5, icon: "◍", grad: "linear-gradient(135deg,#0096FF,#7C3AED)", info: "AI chat agent · 3 min · The same pre-qualification as SCAN, in a written conversation — built for high-volume, mobile-first funnels." },
  { id: "SWIPE", label: "SWIPE", short: "Personality", cost: 20, icon: "◐", grad: "linear-gradient(135deg,#FF2F92,#FE8058)", info: "Visual questionnaire · 5 min · Measures 20 personality traits (Big Five) — how someone works, collaborates and grows." },
  { id: "DRIVE", label: "DRIVE", short: "Motivations", cost: 20, icon: "▲", grad: "linear-gradient(135deg,#FFA800,#FE8058)", info: "Paired statements · 8 min · Measures 20 motivation drivers — what keeps someone engaged. A predictor of retention." },
  { id: "BRAIN", label: "BRAIN", short: "Reasoning", cost: 20, icon: "◆", grad: "linear-gradient(135deg,#0096FF,#029CAF)", info: "Adaptive test · 8 min · Adjusts to the candidate in real time. Evaluates reasoning, problem-solving and learning agility." },
  { id: "VOICE", label: "VOICE", short: "Skills & languages", cost: 25, icon: "●", grad: "linear-gradient(135deg,#029CAF,#0096FF)", info: "AI voice interview · ~3 min per skill · Job-specific scenarios validate any technical skill or spoken language, with a CEFR certificate." },
];

/* ============ PRICING (public direct-sales grid, base column: 36 months · <250) — 250k updated Sept 2026; 275k–500k pending new grid ============ */
const PRICE = [[5000,3500],[7500,4900],[10000,6000],[12500,7100],[15000,8200],[17500,9200],[20000,10200],[25000,12100],[30000,13950],[35000,15700],[40000,17400],[45000,19050],[50000,20650],[75000,26500],[100000,33200],[125000,39500],[150000,45500],[175000,51200],[200000,56500],[225000,61650],[250000,64900],[275000,71600],[300000,76350],[325000,81050],[350000,85650],[375000,90150],[400000,94550],[425000,98900],[450000,103200],[475000,107450],[500000,111600]];
const DUR = { 12: 0.2, 24: 0.1, 36: 0, 48: -0.1 };
const SIZE = { "<250": 0, "250-1000": 0.25, ">1000": 0.5 };
// Channel pricing = public grid by client size (verified by AssessFirst at account creation) × commitment − tier discount
const DISC = { reseller: [30, 35, 40], distributor: [40, 45, 50] };
const TIER_NAMES = ["Core", "Premier", "Elite"];
const tierFor = (tk) => { let t = PRICE[0]; for (const p of PRICE) if (p[0] <= tk) t = p; return t; };
const basePrice = (tk) => { const [tt, b] = tierFor(Math.max(tk, PRICE[0][0])); return b * (tk / tt); };
const publicPrice = (tk, months = 12, size = "<250") => basePrice(tk) * (1 + SIZE[size]) * (1 + (DUR[months] ?? 0));
const partnerPrice = (tk, months, disc, size = "<250") => publicPrice(tk, months, size) * (1 - disc / 100);
const CUR = { EUR: { s: "€", r: 1 }, USD: { s: "$", r: 1.2 }, GBP: { s: "£", r: 0.9 } };
const fmtN = (n) => Math.round(n).toLocaleString("en-US");

/* ============ SHARED UI ============ */
const AF_MARK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAABHYUlEQVR4nO29eZwdV3Un/j3n3lrf610tS5bkfZUwBmxiFtvq/mFWEwKE7oSEsAxgAxMPiyGGZIbXHQYmYAwhLEYyyUDC2s0yCVsmhHTLZkmCPaxyjBeMF3nR1stbq+ree35/VFWrW2rtLTDzmaPP+7S6Xy236nvPfs69wP+j/6uJft0DOBEkAEEAjNXy57v9dsLIogMmi58bN8oYgLGxcQEBBMivdqQnnn6jARaAUKsRNt1O2L6zeJYhR+Pj7piuV6sxMM0AgNtXCzZulGO91hHfU4SI6IRNrN84gBdA2LRaaHTSLnfMxMSIesoDG3v2eqanu9nqPj19MDYOkWZHAGCgnAa37onXNTtedb4imD/tTWNzB3vRUtus8/8d++RZ9roFuD/72c/8xz3ucelKXXcx/UYAvADq+Da7WIzWajV+c8/O0yr11vnizAXE7jwinA6RtZnyBgzpqg/xfSQAUfG0AggDYtGGh8zpJHBS96zdDecesiK/YKdvzxD9bA9X7lj/7g88sGQsEMLmMYUhHBfYExMTanR01H7ve997kog8+PSnP33nieDmxyzAIiCMbVb7gzr33leeXUkblxKpzXB4soDPVFoHYEYOngOsAE4ACEQEIhCwza8hDIAgIqRECASAPIBUcQcGnAYyBZPYFoncRZn37wI1vbMr/O7J777hvn1jFJoeGlND28Ys4ciBmZqa0sPDw+a73/3uS6y1M5dffvm3a7Uaj58AdfCYA1hqNcam22mx+G3c8KILwyR9AUE/T0Q9SXmeD2Egy8G0Agtw+YIJEAKYKH86yi2upe9fctRzw8oR2Ik4p0QciRIFZ4lZNIM0AAWIQpa5lkr4VnH89ZaWr3bf+KH/WLjeyITCxu2H1dlbtmzxrr766uw73/nO6wFUL7300utLbl6ZN7iUHjMA7w9s/foXrY6o/buUyR8K9NNUoAgGQEKwQhbCAiEGVCF8ednr5igvB3DxvRTzQQiwCuIAdgpwAByLsyRsyUE0wSkF8gHRsEmWwXq3wHmfecj3/tcpfz2+Fzg00Lfeeqt38cUXZ7fccstbiei3Lr300tETCS7wGABYamBsAtEoLAAkN1xxgUZ6NaBH2fMHkQFILCDaQJicKCYwiaNC3OYi92AAl0Qk+yCWfY/NQhBHgCOIY8ABVAJsFSAEsgriCGJZ2LGDIYEoDY4A58N00ofZqc81lbqp+3PjdwAF0JPbhZADvUgsv91a+2qt9eOf+tSndvKx/V9oRYuAMDnCJcfOfvi5F1fc/FvY4iXsex46DsiUdTmAzE6TQAFOASjAAAGySHcCONgjEUnBtYu+F4CEAUc5oOX/LcE5BXYMciVnE8jyAuiwJM54DlaBhRRUDJdkHTj9hTbwwepX3vljAJDNNT09NoTh4WHzve997x0A3pUkyVnDw8O/FBEmohPqhv1aAJYJqJJjO3/11PM8yt4hjl6mfM1oOTjHhp2nAEUiBYiiAOh9QICxj4sXc/BSTpZSNsuSv+W2lSMARHAMcjnYTggw+QQqARarII5BNv+IMMQCMLrkbmFLFk5rUAybmUxZ9bcdjb+IvvqndwPA977znVrfwMDYI4888szh4eF/Ljn6xL3lnH6lAOdcC6ZR2N21s7p71sTXseM3suYKWhbOsWUJWEBETgGSv0yILgBWiwAuvyeIkAAsEBIQ5QLYgUHERIUeXnhSLq6BXOw6CEQcLEREQwTEloic4lI0Q1TB2QzYnKPLn2QYLtfXYOOJNeyUkIKuwhnT4F2Nd33vL5/TvXrD2j976J77/mTzM4av/1WBCwD6V3EToOBaggVgsy3nvJCF3sc+zkYzg2uRZWjFRApwIOhcTZLkLg9s7seCIEQlCzpAnDhHDK1IMUErgDn/iMAlBja1KSAdECcCNvmMcBpAAHDosfLAsUKI3Cp3BCQEZx2ciHFCpJwQOWKxAjgGnIAc5xOskBiFsUb5M5C4pOW4g+rulzzhvb1rBzH/47unN//Os64HE4Y+tutXFhL9lXCw1KBpHGbuw+cNxFF2g1Z4BTINJDAAKzhFIio3bsCAKCzo20LnwjEE7ESUg2NWymd4GhAPppMICe6DeHeQyO2zYXznrsjc19+iRwdn0xl0uybmkSLcmD1SvYfWNOpeI40C7XPFKa8vSQfWZqpzWm+rfq5y/vli+VwCr1fKy7m2AyDLnBXlYJWCZWKrQZbhFsQ4AKsB54EMgAS497lnyz1XnmkH75jF4//qJ4kz/DmdJm+l294+J5trmraN/2aL6MUiOfv4Kc9g32xlzzsDDbIQJjjNpZiFaIgwyClQ4XdCVK7vRFsYAmut4PtABtgU95GoW1Id/4vxvX+vzt13D41v66zIuGtXxWmncrZK0kskoWeQVU9XWq+D00Di4DJj4TTIsMqNr1xki9PgVMFah3tfsBH3X7oB0Z4Ej//wj1B5OAOCXsB0fp7J3Gv9f/+zW3JLe8QdTZDkaOmEASw1MI3DAYC56fR3KK/9boAJCRsIa4iCOJ0HGxwXgBJEFEgUyGmBsBNRivwAAMMm6n4l+AfD3ld2dsu/rrv6a62l91yULNi0WrB9Y/7ixsZlydOKAGNjxOPj7uNXXeVddcWMw/aNBExjuXjzrre9tytqzjw9amUvsk493yPvZFiCTTKBJcdWKRIFZARrGHe/+AI8etEaUCo471O3Y/C2PZAggKRimEPtnLXW2bf5P3zTBwFAUOPSnVppOiEAl1aybFkbO7/9Nxzp30ODHRwD0IzCcBFROcCicmtUcr3mnLIErTj0IR2CiP6WEf7reXvqNwav+5v6vvuMqDyLNOQwPi5Hmu4rw4Lve9/7aueff/4nfvu3f3vH4jjwxMiIOqOvjy9au1Zw++1Ck/uiave+ota7IZUrIXg1C4ZJNCTNgFQg4uHnv3sBHrngJDAIp3/tXpzyzXshYQQk+ejIsgOYQBVyrvXJexp3vu6cuz+cCEYUYfnkyfHQigNcgtvc2r8+jNyX2OffQl0M4KnSJZFS/BaWcG4xKzhHjqwmjnwyHWVB9AVt+MN07Xf/dd/1RxQmAUxOumPJ346MjKjJyUn7qle96vkXXXTR31922WUbL7zwwp8XoMvExATvH1kSgDAywgCwGOz5l9YurRh+IzryOwLS/zHyBNp17iCEgTW3Porz/+d2iBeCTBlMyYMo5EjgyELF2madm1W7NUK/eNtOwYQirGxUa0UBLo2pzl9XN3qBfI09dbprsmFi7SQXxSQKrjScSv/WKhFhp3yt4DQyq76USvye6jW3/J/iuoxNI4TRYwO1pFqtxgCQJElPq9X64VOe8pRTN2zY8MzLLrvsnz/0oQ8Fb3zjGxMAeP3rX3/GwMDAU971rnd9rgho7wuCAYSRCcbk6MJYdr7q+ufuvvLxX3l0Q8UTK9T9aOIe/+EfsJcwOdGAIZDNARYhcCHBnLWGUdFw2R3w2lfST9/yi5UGecXcJJmCpmGY9Kb4Iq7YbzBoNVrOsIIWl0eS8tSNAOTyaBAxxIll5RSHvnJtutVZ86f+NT/6FlCK4DLpPnmYERwR8fj4uHnjG9/4wSiKTq1WqzI3N3eOiHybiJJrr722IiL/OY7jP1u3bt3fEdFna7WaHh/fZ+0SIJgctSKiQGSnvvGN9T9fveq/sRNPJQlCx3TR53+u0AaMYscGDMnDLSKUP7oQyAkYSsN0DLR/nkv96c5Z1z+H7h69fSVBPnQA9whJJqBoGCb9pHcR95h/UpDV6DgLdroM9AsAxwIhB4HL4/sCoyJSTqGdtd07+NEXP9W75mffkgkoqdWYRiftSiXYJyYm1Pj4uLn22mufGwTBK3zfn+3q6iIA64hIrrvuupdrrW/TWr+3v7+/+/zzz78ZAIaGhg58XhFFRPab3/zmaWFf3z9XST/VtTs2iiLuNDsvxR0PviWL/VRTwCJicoAJJHleC2XIVAAwNExiWLwNAYJvdU79i/MJo1YwoQ648THQcYvoBYPq7/yNLsQ0A4OuBcsMlYtgneuf0r8VhrNKCHAq9pXp6H9NMvW66uvv+jEBcIvCmCtFIkJjY2PU6XS6nHM/tdauX7t27dyTn/zk3p07d37vlltuqff09Dw7yzIkSdK5+OKLad26dU8ZHh7+0f7x4jIKdfPNN5+jtf7fvu+f1mw2O729veHczMy7Lh8aeicANIf/x0Vx5n8czr/YdhKrnGIRInFUhEUVRKTQyww4Z0G+cjZ7MLXty6P733bvSljXx8XBIrmP25yI1rlAvsnsBtERSyxKFqtKsihFs4hzSjtSkVauFX3wx7bv8urr7/qx1DZrAbDS4ALA2NiYGh8fd1mW3RAEwQZjjOnp6dHGGGRZdkkYhs9ut9uu3W671atX64GBgV0PPPDAXeVjltcpwZ2enr7A9/1/8TzvtEajkfT09IRzs7NfvXxo6J1TU1NaLtriVabecdsvH/jJZc62PqpUpBwxHJxbSFcDOVc7Qh47JQWXGmZvfagq35g/5/2rCONOUDsujI5ZB4sUBTB/e1LFyq6vckinoAEDJTqPBhNgXQ4u5eE9sbAqgHJCbdfiq/XVP/87ASj3mbedkKhOkW8111577XN93391p9OxWmt0dXWxcw5RFKUAhIhiIkrPPPNMX0TufvnLX96s1WoL3LsI3CdHUfR1AIONRiOrVCpBo9G4K65U/qhWq/H09LQbvm3cyciIoslPdXAf/ji56PofaoluVFCecZljEJc6amH65D+1s6lhqpxX6bgvy0VbnoHb+pxA6FiDIcc0OwQgTEMRwTm9529VRZ7oWtaARS8+SlhQRvatiOUICuIetmn4DH31/X8nU/kEKwMiK00iQtu3b5drrrmmG8DHnXNireUgCEwcx8oYA9/3VRAElGUZVq1a1V6zZg2yLPshAAwNDTGwBNzLwjD8FhENJklifN9X1tpWp9N5ycUXXzy3adMmKstuaHLSCkCyuaaD2972107az3JwuzUHLA62hGsJakIgkHaubpjDy9yu1pbc2Bo7Zn18bOw/VRhVn9Hv5F77YteQjAhayC0BlQAIEZyD1bEoa+UuJPpy/zX3fb+0uk9kLXIpmj3Pe38YhqcYY6yIULVatb7va2stmFn5vg/nnJxxxhnMzCCiWxcetQB327Ztz4qi6B8B9LTbbUtECMOQO53Oq6+44oqfTE1N6f39ZwKEto0buegqz/vx26YNZoes2PsVR8o6ayEOBMAV5SUiLk9kCGuYVsbofpVZ//5rCONGUDsmaXvUAJcWc/b54Aqv4sbzIMZiUe8gJHBFNkictaoiyqZyR9LgYXrtrrulloN7LAM+Urrqqqu8wiV6tu/7r+10OoaItHMO3d3dQkTKOQciYq01+vv7OwMDA/H8/LwopX4KAO12WxWc+4Ioiv7BORenaeqISLq7u3Wj0Xjv8PDw5w+X/qPbtmayuaaDH79ze5Y0hq2k9ygVKitiy9x0SWU4zpJo51qWJPqAnPRXv1WAfNR4HdUJUgNjO2TuWxhglX0KzokTMO1njRfqGU5gOYayGd+VNIIrKq/fu0MmoGj8hIJLtVpNb926NbvoootirfVNzjkRkTwSRWR7enpIcq4RpRTFcWxOPfVU63meMsY8smfPnl9MTEyo5z3vecnNN9/8+1EUfTnLMj9NUyci0tXVpefn5/9x8+bNb5+amtJDQ0OHNQxp27iRzTUd3fWOXzTM7mdZSR/QHCgrLq//lDJc7kAQKCGCWGKwdgqflsdfXwGQl+0eBR3tjGAah4tm6KMcy8lIyR5Y7Zb/KgLHPilr1MNZO37OArgnwEouaWRkRAGQwt/d+LKXvWwyCIKT0zQFM7OIwPf9rFqtKhEBM1On05EzzzyzNTAw4BERiOiOe+65pz06OmpvvvnmV0VR9Lksy9iYfE6GYaharda9Sqk/FBGanp52R1pTVYLce9f4L9o0+1zn3F4NTSJwJAIqKwFz3wlMwnCJYQ7Pdnvk/bnLNHlUmB3xbCjB6XzG/92gK/si2rlolv0fTRScEyENEfaSpF7dXPlPe35QhjGPZnBHQVTGkK+55pqAmd+2bt26t65du7ZnZmam8cADDwTOOU9EUK1Wm5dccokvIp61Nl23bl371FNPDe6+++6k1Wr1dDqdv7zyyivffPPNN/+XOI4/1G63nXN5R4TneY6ZsyRJnr558+b/c6wVkWUuODvz+iFC9C0SS2ItM6goUUIOduknCxkwa4PGFd5Df/bto4l0HRHAhUtEM5Po6nFqO3v2ZJg8DrM/wIUkNByyTpv0+8HLsi+UBtXRvYYjo8Uv+W1ve9twlmUfOOmkk54wODgoxhintVatVit74IEHJE1T/9RTT62fe+65XQCaZ511lu3v76+KCDvn2nfccUf48MMPX7lhw4b1XV1dW+v1urXWMuVkKpWKnpmZecUznvGMvz3espsS5OTM97/Gp66brGkZEuiywpcEgLgixOkck0/W2btU0Hch7vtlCozJkbhOR2aZFUn75PPqndzj1mEOBnTgufmkc0Z1sTZz6vrgZckXZAs8GkZ21G/gMFSr1fj222+n0dFR++Y3v7nf87w/d8795/7+frd69erEGOMTkbLWolKpeKecckrn7rvv7oRhKL29vfPr16/XcRx3Z1kGEZEgCKLTTjttjoj+wPO8l83PzzvnHBMRiYjp6enRs7OzH1wJcIFCXGOLR/dc/Yn09A8+2ePKVc42FhmsRSwBAhZmJ6lRVD3HtnddqzH+bsEmBRxe3R2WgyUvOpJk0j8nUNlPAFHOgrkMdCyaQ87BqgjKdvj76vfdpRgDYwy2aC1YMVqcALj22mtHlVLvVUqd5nleY8OGDT4AP29ZETjn4JxzQRDYJElmLrroouzss88+Kcuy0k1auK5Syj744IOqXq8LAGJmOOdsV1eXajQa/3LZZZddMT09rYaGhuxK1DLnBtMk46yHtTXuBwreBcYljoWY7cIxJRcLkxYnaYtV63zsGNsBjNHhQpmH5+BJEI3CpV8w70YoPhowvMzEEECUB2SOms7Tr9CUOpGFvpEVoVqtxmNjY0JE5tprrz2dmd/ned5LsiwDMzfWrVsXOedUlmVQSpkgCLJqtWp7enokjmMVRVFftVpVxhgujKylz5Drl5ZzLlZKwTnnoihS7Xb7AQC/DwDT09NueHh4RZ6JQCIYAd09mSRnvf8VlKl/IyF2kmcnaMmxILjMMsdVGKkR6LWCicMaXIfk4NKwSidwkdL0A2QiVDT0LK5+AQrurbJK5vjN4R+Zv1xhvUu1Wk2VXPvWt771Gmb+c8/zepvNpnie1zn99NMRBAEHQWB6enpcd3c3R1Gkfd/XRKRKbs6yTHp7e7Oenh5PZKnLoZTC3r170127dvnOOSEi8X2/mSTJczZv3vy9E9VmIqhpwrjJTr1+TFO1lpmGZYECcmOLFvSyCKDEQWym2hcED73zTqB2SC4+IoDt5/gr3OVeaOuwTDggbOYcrAqhTMK36jvcJdgEwiiOKzlfUlmBAQBvetObLlZKfcDzvMvSNAURdYIgSC+88MJ0cHAwrlQq5Pu+R0Q6H5eDc26fj5m7QbDWuv7+/rS7uzs0xmBfl1r+01qLNE2N7/v60Ucffd+TnvSk6+68887gnHPOSY73eZajBVG9cbsy9eqPNfxzjUuFBExOFkAqlIIBRdq5xqfUzne88nAW9UEBnpiAGh2FrU94F8TK/JCNUBHUWDq4XEU48ohspi71X2q+t1L+bskx69evj17ykpf8aRiGb/I8rxoEwXwcxyoMQ62UshdccIHr6uqqFgbTwodo+ccjIoiIWb16tQnDcAnI5fcARGstnufN1ev1161fv35CRDQRnRBvoASqfep7nhNK5ZvWphaAynVxMUHzly15OMSljPZG7By/91BcfFAdXC5pETtzDceiXApDtGxgxKgKdFbnCf8PVw7cWq2mR0dHzQc+8IGnA/ig53lP1lonSqmUiLqoQCFJEuzZs2c+iiIYYxb06sHABVCCr3ft2uXWrFmTaq19a+3COQXHU5IkEJG+arX6hR07dvQQ0U1lsv94n29/KpP8dN/oP6brrv9Hj4PnWNeyuXrZd1Re+yOGuRI4596ggLcKoIDlEzbLKmmRvNuv/reV1UL0e2hBsIxoFoGAwDbhtO3F7xQBYeT4xfKWLVu88fFx87GPfex3e3t7pwYGBp4chqHVWgcAfOccWWthrYVSCq1WC0Rk9zeaDkUFl/u7du1yzjmz3LnMTGmaSpIkrq+vb+uOHTv+hIjs1NTUCeoIKcqSlPmvFqmjPJoPLHzyJI6DKLhUWNzL5YzrevI49fLSePk3Mp2DGfnJ76mKdDsLu3+8GfktLcdgl/IXekbrP8ckmOj4Un9TU1P66quvzm688caXh2E4aa3V7XbbOufUYn268ADMaDabOsuyTKmjy6oREdI0DWdmZtLluvyICEopsta6+fn5ZldX13vvv//+3x8eHjYisiIlNUvuh0krmFD+/e+4zUr6VeaQi/UKCspTEwwmIHFQ4aBtRi/Ov6stO57lAR6CFQHBySuQ7d9zufhWUGnGthHT9SKg4y2Lq9Vqenh42Nx4441viKLoU9ZaKUTnIV9mp9PxWq2WYeYDJsChSESglEKj0Qjn5+c7zPkqAaUOFpFMRNpEZJxzfpqmNoqiG++///6ziMiWCYyVpcm8fFpl73UwyO3CspatXJbCFUwtAtGvLE48MhEtAiaCNL/gPV759onoQIigSLA0MCZkOQIhkX/uf1H2UwA0euy6l8rgxZYtW/6kUql8NE1Ta60lOpQy3Ue6Xq/nifbCUl7usxw558DMPDMzEzQajSTPSUhCRG3kLy0gopCZvSRJyPf9Xt/3Py0iHnLPZUVLj/Pi9xrF99W+b6jzHWafHZzFElEtOSNLBiJ+Wufk2jkHK+85cAZO538LYF6MEAzZV31QDiFPZedSXzR/TADC2DFWh4jQxMQEj4+Pm61bt45XKpX3FiKZDwfuoq9pZmaGjDGpiBhrrS24LxORFEBCRIlSquN5XtvzvLbv+60wDFtRFLUqlUqju7s7cc41AexmZipKeAIAXFrlzMyNRsN0dXVdsmPHjusLY2vFRTUKXBS5G0vZSSAIAWVLc95EYCzD12zxwsXnLaYDjYVCPLvP4/lFBDmXV7TwXwjg2IcyDXX/wyev/6fTcB8wfvTcW1Y7jo+P261bt34gjuM3N5tNU1iqBwW3cHNQRqy6u7uzU045ZeeqVasGAWgRIaUUFcdSYUCRiChmliJ5UMphBnJdTkSklNLOOZNlWUZE3v73ZmZdr9eT7u7uNz7wwAM3E9GXV96yHrcAMBPWv9rboEc1BSc5yfK44OLXTI4gGRjqBQDeh2XE9NJEfdEw1vmif7Zns9vZQRdu15LDnSOjuqDTBn0weKl9y7FErUrRRkRy0003bYnj+KpGo7FfdciigS4KQoiIi+M47evrs729veqkk05ycRy3AVQqlUpY5m73u98h/yYiUnB2XBQIJFmWiXMuICLe71irtRZmrs/Pzz/xjDPOuG+ll2Moo1ud9e/ZGqDyWuuahsTlHeolJDk4BJEOvM459NC7H9i/1HYpSw/lv+tUhjgSDYgp+7AXzwUisDWE3TF9CQCw6+hco6JaUcbGxmjr1q2fKcDNsB+4pe4suFVEJO3r62udc845ncc97nF8yimnVAYGBqSnpyfMsixuNpuJMUastQtRrMXRrP0/i+8DwDBzKW5JKRUGQeB5ntcBkC7W48ysjDEmCIK+KIo+XUiBFdbHm0QAEmpP5g3KrqxIKSS0g7AQ4CzYD63g8uLEJZguBbgAStgNg5bye15tIHAijj1h28YvT07MDwAAo0fuGpWdfddcc02wYcOGL1cqlT8owF0Qh+WLNMbAGGOjKGqfeuqprQsuuMCde+65wapVq2Jm9q21SXd3N2utmZnRarW0Meao/OGFF8FsiMhzLn+U4qfWWsee5wkztwG4RZa6Pz8/n/T391+6Y8eOd6+8Ps57n2b77v2ekc7DijVLUfIhRBBSoHzlCoESCPHQcldZzDFEo7BTU5u1PPKdJyNfOfGAFU0c4FRATBlN0SjSqaMQz2Xo8SMf+Ug1DMOvhGF4Rb1eN0TklaA652CMEd/3s/7+frNq1Sp0d3d7WmvPOQdrF3RQOjg4KJ7nhUXAQ4wxXqfTMdVqVRcFdUf0Kp1z4vu+lGU9C49b/F9rHTCztdZ2jDGaiHzkK63R7Oys6e7ufvtDDz20jYj+caX0cW7GTij6yWgzXT9+M8j/PcBaIaepdFIdA7AMMSDgkhpqXOrvkhYAlFoug8+c/+FpQnSapOV99pGAIMIEMFpKfxsAho5wwCW4N9xwQ38Yhv87DMMrms1mxswayLnVWmviOG6fccYZrQsuuEDOOuussK+vLwbgpWmKMmYsImbVqlUmiqJQRKQ0kIiIm80mOefckYJbHJdxbjove0wxWZTWOvZ9X0oXSkSUtRZZljnP8z65c+fOtcjV+Qr5x9tzVcvy7TyDV7pJQFl37kAEsVCCs687ub4unxj73KUFDp7OwXYD7c7j/Eh02mLLJIqQK3VHBAsWIlKdNpuUvX8HOsD04cVzCe4HPvCBtd3d3d8Iw/AJjUbDiognIi4IgmxwcNAMDAxwtVr1CksWpbG02Je11rre3t40juOo4ObSWINSStI01caYzPf9oBS3hyNmTgFEhwqSlN8ppQIistbaJMsyBqCSJOHe3t6TZmdnP0lEz56amtKSd5Qfb9jWAUCqvH9Tpi3EVhV+EhYSEEyUO/Nh6Ck+H8ADwKaFmbqAdNlEJ4QLoAmOWBwUrBBsUcxpQaJ9BeP0fYMDT7oXADB+aAOrSBrYrVu3nt7T0zPted4TZmdnDRG53t7e1llnndW+4IIL6Iwzzoi7u7sjEdFZlpVcsySVZ62Vrq6udm9vb2itXQC2IHJ5BapqtVpHLCKttaKUAjOrI4mCLeLmKAxDMHNLa92Yn5/fo7W+4qGHHvofRTnPCujjfOmJqkvvFLY7mH0Ck1tYGipfbxGO4EAaZPG4/LztBwJcGlgZ+edDFCwxHDEsK2TMMKRgRAlphRTedhreZmQC6lA53zI6deONN24EMC0i5zjnGhs2bEg2bdpkzjvvvOCkk06qaK19Ywwt5tj9qegjavf29ob7i8Ay+0NErjC2lLU2O5yxRURg5lQppY5UpJf3c87B87wgyzKem5tTRNRnrZX+/v6379ix4x1EZG699dYD/OijoVLc0n3jHQL/B0jDQYqVFwUgXjgwb6Og8/e/xj4ja6QQtYLTrWVYyRvfiBTysDRgicUpgiNsBwAMHjyfPDIyosbHx02tVnuS53lf6+vrG+ju7q739PSEvu9rESFrLZZLuC9Hnue1BwYGNDOrxam9hZeRgwUAyLLMa7fbSVdXl3eovDCwYD2HRxPDLslaiyRJeHZ2NgqCAJ7nyezsrOnt7X3Pgw8+OLt+/fobywVIj/riJW0GYxuchfsPRfxMJhaCFP+K55bc5xHCmcVZC7pJA3lkkwjys4kRP5PptW2XIONCg4jAgYslHAUNiTFH3XcCc5g+yJgKp99OTExc2tPT88Wurq6ToijKiKirMEoAYIkIPhgVRlWyatUqVkr5y4G7+FplO0qr1UIcx46IDsrGhfVMVJT0HA0V45JS6uzZsweDg4OklFL1et12d3d/bMeOHXPr1q377HGDDIDY/jwPQBOEXLFaAsqQMYEclLiTy0BHEfYqRF3xbI8Eqm9OdfU3nY82fGqxhyZ5aJNCmzx04POcDTDLJ90HALt2jRzwVkpn/5prrgniOP7kmWeeeVIQBNZa65UVF0cC7KKXmK1atcr5vh8cDNwCHM7/mxfTJUniZVl2UDFdjMEw81GJ58XnA7BZloGIYIzBnj17gNwW4Ha77aIo+rsHH3zw+RdffHEmIseWQ962SQAg1d59IIFjlJEOoHyPBdrCamDmok5XfmIODQPAWLE7CYnt7VBUacBHhwKkCNChEC2O0JEQKQXcSEVCt/tRABjZPnkAwGNjY4qI3DnnnHPNwMDAmfV6PXP5qitH7JeWxzrnbF9fX1ZazEd6fqEjdbvdtihAX46Y2QDwjtTa3n981lqXpqkqroU0TbF7924wc6l+KI7jyfvvv/9yIjLHBvL2PKri1CMQA8dgIQaxKvVurotJQCJd4Qx68vPGCCgA3rRpnABgtf1xt1IJN+BLizU12EebA7QpRJO1tHSIOgftWWNn82ssNbCKVWzcTTfddFIURX+mlHLWWn20HFJwhPT29naq1Wq0KLhxyHOKRAKQN5Wh2WyytXbZao3CehY+hrBXKYWMMWVx/MLf2u02ZmZmoJTiIpYdVqvVf3jwwQefSETmWKtBLGMmJWuY8+WyhRaFcokIBDBUEGWVrsXnLXm4JkxXphkdiaSNCPknRAce2giRUoREglaoq83lBlE2QKdpOj4wMNCrlHI4TOXm/lRwBqrVaru7uzsq+4IORaWILnK5KO9pjPHb7Xa2fyHA8YrnktI0ddbaJe4QM6Ner2N+fh6e53Gn03FE1BPH8Tfuueeec46+GmRMAOCh/vmm07rNrAAGiKlYeHWfNgYrZNpW8l9v38fBZYndvHSHDa8bLY6kRSGaHKJBIZpUQZsr0qEqWuhK6oOPO6B8tAxm3HTTTY/3PO/VzOyUUkdtvIgIgiBo9/f3+0caEVrOCi/zt61WC9baAyJbSikDwDsW67mkLMsEy+RgmRmzs7NoNBrwPI+bzaZVSq3p6en5xzvvvHN9YYAelZ/MndUJMyVgBkjluxlQAbJigEnACkb7weLzloiLjop8RYQWW5SBMbewZL7AYw8domx+V6uonjhwINba9wdBoCuVyjGVtDBzZ9WqVYqZ9ZHq3YO5QkSEJEk8Y0zq+35YXs85J0UCgY8F4EIku6ItddlUJBFh7969UEohiiJVr9dtT0/P6X19fd+8/fbbhzZu3LjnaFKMXQE7SUkABcc234JEGEBe7EEuX0bZEvz8jBEAk0tnX4ciaiFGg0M0OEKLKmhRVHxiNDhA88Ac+AL3bt269flRFD0zTVMbx7E6moB/cVy6atUqHModOtQlgANyvBARr9lsLijxxanBYxXPJcBZlh00fl3ef8+ePUjTFJ7nqfn5eRPH8eMGBwe/+qMf/aiCo41bswIUg4hBXDYQcf5MKudms59cWHLxeRumdaqgjgoaiFGnEA0K0KQADYkxjyoaHOtmM17sXtH27dtlYmLCF5H3GWMkDEMKguCIC+AKrjKrVq0yYRiGRzMx9r/OAe+EGe12eyGyVRTaGWbWx2I9l/ex1trDAVzaE7t37y5LfPXs7KypVqtPPfnkk79822235XGII8gjq7wnjaAUJBfJAKvCmi7FtUChyAMWJbhLAG54UWdeInQQUQMemgjRogrqFGGefGqJjxaiYP4k4wM5vkU9lZuZmXldtVo9v91uu2q1ykqpIwJ4UQIhiaIoPgbOXXSp5c/LsmzB2HLOiVLK0WEqNQ9Giy3o/Q2sgwwKWZZh7969pV2g9+7da3p6ep61fv36zxKRm5yc5MOBnITVwCgOMgKEGEIKUAqiFZxWcEoRCAiZOsC+hR/14l9a7DU6omFILTjTebcEQUighGEhsXMUA5ifnJzg7du3y5YtW1YR0Ts7nY5jZqpWq0f0ssoEQrVabVer1ehYOaq4FhHRgs9bgr3Y2IrjWJh5ITV4nAaWc84dkZdVuk+zs7Po6+sDM+s9e/ZkAwMDL3nkkUc+sWbNmtcUGahl2lLHcgPIZhWjOFICKOg8gCXl5hP5XcQ5eOI1AWAEGxeiP9hYLJzN9bPmW50eaXKVGpzr3AYHaHKAJoeYpxANHUWp6+oFgJmZGR4fH3fW2locxwNZljmlFMdxjMOJ2TKsGEVRu6+vLzxUSPFIiJnBzKSUQpEdWpxmlCRJKE3TtlIqxTEGN8pxA3nLzNGMmZnRaDRQr9fLsXl79uwxfX19r96xY8cNRQbqgOtNjuTujiPbT56nO0ySKUVWMcqPUUpEaaSsOm2i+pL7AsDYWO5rGRPOtiVotVSAFgJpoQtNdKGJKppUoYbEzup+dmnPagC4+uqrzY033rgxCIKrW62WExEVBAHCMMThXqCIwPO89qpVq7wjTdUtd40yyWCMSbMsm63X6400TZtZlnWcc6mIGKUUdXd3R2maxkqpWGutRcQVOdsjDp2W5JxzSZLQ0UiBcqyzs7NoNpslyHrv3r1mYGDgLQ899NB/o2WK6UcKF3Y2UGtEh0hZu5QVElZIWeVZPigIe8g8rj+4oT6Xn5ljmq80V7jK68y6mft1fcZ5fsWmJAQiIYd8ZXYByDgbVFhadEo5biK63vM8L8syKyIcxzG01ti/Y28xFX8vEwjeoY492MsqOBbOubRer5u5uTleu3Zt1969e9VDDz3k+75vmdkEQQAAd4jIp4lofX9//0bn3NPKrkJjjKG8Y7DYqwcL9dgHG5NzTvLTjs0QLN2nIAhgrVUzMzNmYGDgz3ft2vULIvrM4rKf6Z2DBAAtPzjV2AgmywQscCJgYahcVovPPqVkdp/9zfF6Xv1B+wBGnn+iV9GrOr/3zXc+4il/fUJGBJT7W+SQr/7iw+gARqcbAeCjn9hyZeSFz2u1WpaZlXMOXV1dyz/ZogcUkXRwcND5vh8dDbglsEopWGuzRqORzs/PK2ttpJTK4jiOzz33XJmfn3cAfGOMiuNYzczM/MsznvGM95bXefjhhzcZY54lIs8joou11r3GGDjnEhFJmLkMYTKQL+VQGEGs8gaojjFGL/aBj0YCle7TmjVrJAxDknx5J/E873IAn8Ey0T924bmJ8tHWGpoEngiUA1gciJ2EyodxnYeIihxyUTq7IA5GJvPlANoU3dvU3Wgij2Y1qIJ56kKTYzQ4pqaEaGj/HAKgLN5XdMIvvPxKpXLIwINzzvT19Zkoio4Y3PJ6WmsAyBqNRvPRRx+1MzMzkYiERERRFBkR4Wq16p199tlZlmWuEN3wff9bU1NT+hvf+EYAAGvXrt2+atWqDw4ODj7TOfdbWZa9wVr7TedcUq1Wu+M47nHOdXU6nSBJEtVut70iYOKazWb94Ycfbhlj6iJSF5EEQHY04r6MtYuI830fhcdBIhICwPT09MKxQ9um87Id1ufXFdDyFDW1RlN7aHoKTe2hpXxJPB+WwnsAAJuHDqzJ2jmYl3m04N+hOCydKTiSfH8/AiBExvhowWz42I03/nEljjc2m01b5lODIEAURcvq38XuULVaPSJ3aDGwzjlTr9fTer1OSZJESqkFC9ZaK3Eci+d5nCQJ1q5dG+7evbuzZ8+euN1uz2VZ9v0rr7zSiIgtrsvT09M8lC+mcheAuwDc2Gg01nQ6nWHn3G8DGOru7l7reZ6en59HlmXt2dlZaTabVSLymFmccy1mzgAoIkoLLi724MOS7oz9Y+EiQmmaUpH5Klfe6wWAoaGhvDw2X2XWTYxMRPNzdL7AgZVPDEHmBAwLTXmUsq00WkotbHd7AMAlzXv+T7UEMCSUV1EWJZq5YGdKAJLownnfXei32gIiLh36OI7heR7KHOl+4Eq1Wm339PSEh0sglMAWM9u2Wq1kfn6eOp1OQESqbBNddJwJw7A01AQAn3feefSjH/0I8/PzP3jxi1+8JCxY/HT7ge2I6BEAnwPwuXvvvbdXRJ6eZdmVMzMzf9But3uSJDGFgQbkorvinCtbT+Ni+CkRpcirLql4xyXgS96JMWbhGYri/NK/zGdDDYRxiOnQ2W0vOtlaJ9pjVmLhWYEvOo9xOMdMjKbWPwOAydX7dlZbAHhoGm4bAGrzz1rWOsuecsJ5h/eirCCLg9V+MOMbrE7TPNhdvOyD+b8igjAM2/39/QEOUYy2P7Dtdjut1+tYDOz+uk5EoLW2RRkQiIiMMQiCwD/33HPxgx/84OsAMD09zcAyvTtLwSYUaouIZgF8HcDXv/Od7/xNtVr96/7+/sfPzc3ZYrJQoZZ8AEZE2gB8Zg5kX+eEBWCIKCkcdCoMKE35Gl6lKCVrrRDR6kVjwlgx5kYluyTKBqnRaRuPnNZOwSOLVATkIKECP0Sm3Yi8/wCA7ZPbF17SgqweH88r+E5p7bynKd79qe5Bm0LXoQgtxGghRgchOghQJw/3BCws5brWeZ9ttVpdVv8qpdr9/f0awCHDg0opEJFL07S9e/fuZPfu3V6aplHJsssZMoUv7ZRSqrx2ET3i/v5+XHrppd8F9om9QxERCRHZwl0hEVEioi+99NJb77///qc2Go0bK5WK8jyPFol7IGeUGIBxzrVLfYyca4Piu4qI+Mi5swOgkaZppygMEKUUpWm6Hchj+wCwqeDENFv9jDZHaGiNJis0lEJDa9S1RkMrSfwILeXd+dtfG3lIIDS+qDdpsYgWTEyoydHRdMM/Td7GYfU0V687B2bL+bDyrRg9OOfwixDUUhmU5Ca77/sH+L+0r56KPM87aAKh0KUuTdO0Xq+7VqvlA9Cl8XYwC7UM+lcqFSDnjoVaKa01tdvtVhRFD5Zz4XAA7w82ila+iYkJ9YIXvKAF4A233XbbNs/zPtLV1bWq6MooRTYoL94zANoA/MXfFd+X4roco0uSxHmeRzMzMzsbjcYbCykigNDoJNnaVbfGzb2Nyx1ZQCnlC0GJg6cUtCNoZ53vRZym5t9AJNObpzS27es0WRo5Gcx9LivBVEIhEgmRwEcmAYz4yOAjgwc4Hw/rEDtCgieAFYcoiuB5HhZzkYhkAwMDNgiCZRMIhbMvWZZ19uzZ03n00UdVq9WKy26HI3E9tNYL+nexTeN5HohoR6VS2XlkkB6cRkdHrYjQ1NSUvuiii74wNzd3SafT+XZvb6+WnEoRX4IYiUjmnEsWW9XlZC1EO3V3dysicmEYcpIkbzjzzDMfRe6Hu4mR3EVrNupPS+KutXMkru6FNO/5aOoIDRXkXKw0zSofez1vGsABhZBLjayhIQcAse1MzdXZGVL5Ci+UTyoSAud7n6NNCncEVZzbnoMToFqtgplRcqm11vb396dRFFX2d4cKjhVjTDo/P2+bzaYnImHpVx5pGNE5hziOjed5+3cxiOd56HQ695bRITrO1s6Co83U1JS+7LLLfgHgih/96Efv9H1/jJm5XHC8NMCIKAKQikgL+SoBC9G6Ml6gtTY9PT16z549n96wYcOXpqamFpZp2r5zmgBIW/kv8fwqrHNOibDnGJoBTyyUcxKwVg00O0nF3AIAGJp22LZv3EsBpjyicffY2B1dT7t0O8LgAtfpOIBYkC9ayZJ3OQAOP4lC/H/zDXiFgVVykbVWuru7O9VqNS45t/STi++Ter1uG42Gds7FvMhQO4oXDmstoigSAAdwcKG27yx+X9bAOhYaHh425Q5qT3jCE/781ltvvcXzvJt6enrOnJubsygiYcV4/GJsSRGCDAr97KrVqgvD0J+fn99hrf0vxfflCpU0vo1MbeRn1Qd0+jtGLJRSipEnfDwBAquh2DpwpDq2/oN3fuYZD5adm4vHu8wSDtMK4+MODl83XgQr2llRyD8MKwQDBRYPD/ox7vRDVJVCUCQYRARxHLd6enpCYEnfEJxz6dzcXOvhhx+m+fn5GLmeOuasDjObOI4PmtERkZ8f04UPQ+Pj4258fNxNTU3piy++eGrnzp2XtFqtz3V3dyulFBV62Lq8k1wppWIAPgAJgoBPPvlkvWrVKl/yqpCrTj311BnkXC8AsLk2nc/OLnl+Fp20Zp6cnfd8aigfDeWhrjTmtUJda2kFEZrK+yoAYHrogBdxYIXfrl1FBZv7omsn1wm0guR9o0IODsU6SQ7IFON7UYynayD0Azhr4Pt+q7+/30fhDpVhxWazmdXrdWWMiZRStDjMdyy02D1aRr9zsUBpycHH2wS2LA0PD5uJiQn1zGc+cw+APygMsBu6u7srWZah2JcJ1toOgCaAPZ1OZ5dz7s5Op/Pd+fn5fz311FO3Fw3xC1UnQxhy2wDsCel1gQ/AedCOwFSIZhH4ZERDq8S1DbH8fX7i0BLxDBys4lGEMAbSl3znNkTREyRpWzhRuRXtABGw5LVekmT4QES4bO0gWlY6Jw0OUhAEpS+YNRqNrF6vqyzL/HLdjOMBdt8QBV1dXa01a9ZEsihZLiLCzCQilpnP7+npuWsldPBhxkKTk5M8Ojpqb7311gu6urqeWq/XdxHRHhGZCYJgNkmSeQCt/TscZNG2tgAwMjKhJidH3NPedP9FDP/flUmExTFLvry+B4F2Dr61NvSq7NK5Wz7914/bXKsJj48f+IzL1+hOTyuMDxv++nf+zmr/CWglRfeLA8AgsXACsBU0ycM/ex6GrUlXDa6RSqUSJkliWq1WVq/XKU3TkJmPuMLjSKjU83Ecg5lpfyPO8zykabqz1Wo9VL7HFbnxwccjAOzExIS6+OKLfwrgp4c6fGpqSg0NDQGAO3DijQAgqeO+P/HCLpK2swqWtQN8B3TIQZODB0bmh2Sl8SlgX/vv/jc7yEJo+S4iPZJ9luaaDceecgJxwjCOYB3DCJA5ICDg67NtebDS5/rCwN87M9veuXOn2bNnT2CMCZVSucm8QuCWtNg9WkxE5DzPg4jcv3bt2ub+HHIiqXCnuKjOUBMTE0pEuFarcRE4IQAyPDxsiMgcAO7IhJqchLvgunsu6ASVF81nTdfSWreVh47SaGiFFmu0WUvbj9WsndtNwSNfBoBtB1nlaHkOJhJMiNr1fHpEfe1fJ6USvwrz88UKOLkeJmE4OGgALSH6yCOz/vttku6qNwJPqQWOXWlggYXaaeN5nr9/5KwIIEBE7gaA6elpBZzYPZoW0+LQ52IaHx8//MkjI8AkyW7e/d9V0K2lPWsVFNgJPLJQAmgBErI2Crs1N92npz40PLu5NqW3jS+/Cu4hSk6KqjydfYhbbQdhXtgps1xUTwhWCIHS+PtdMzw12wh7A48dVp5jSyoD81EUCTPzwTJXSqk7AKAQhY99GhGFUbIDtZmhtNL1gqZp2YQD1VSMlma0tC4+LC3PU+2smfqu/VEA2Iahg9oXBwd4dNRiYkJlz7nsx+iYb6BSYQhs0X0MuHzbclf8tEL4yN4mUrv8msMrTDaOYzpISQUVoP8cWJpbfeySEEaAzbWaTsl9KCWNjDXaWiNRGolSaGuNplZoMtus0k/zCl/c9rGz78aEKCxjXJV0RFgETt5FiSlaTh1EuPjkcehMHDwQfti0+OxcB91KwZwgDgZy/RsEwf7BjZK41WpBRO4BgKGhg8/uxwzVoDBK9t/ozdeauP/xada2iWbV0YROAXLGjIxZUu1xatpGBe49gBAmD70E7KEBLri4/eKn/Tvazf+FqMJwYvNaWoEIFaU8+ToeHhE+uruO7YlBlfmEbHHmnEMYhrZcqGUxiYh4nkdZls0rpe4v/3wChrFyNDKhME6mWpvf6MJoLM0ya5RiW9Y+EwPEsMxwxNbFXdyC++w9/33tdkyAMXnoPSQOz8EjIwIRqiTmzzhpp2BNWLT7c76bNRVxakbDAO9+eB4GArX4wBWgQv9KFEULW9XtR2WS4cEbbrhhb3HOYxdgEcLICFATnQbep4znh44ETmkSZogiOCY4xXCKxfqaM5u2oG0NEML2w7/eI6nadpgEN1469B+qlX0McQ/DoeDisi0tt5Yza+Ex4dZmhr/cXUeP5iJuvXLEzDaO44M1jYnneQDwi/HxcScnYNHuFaWt0Bgl60Vz77dd4cWSZUZYKWGCKIYwQRiwTLDE1sYBi6Q3zI33/RIT4EPp3pKOzB4ayRVv3No1rmZnH4L2FEQcCh0srkyDAdZZeAx86tEOvrI3Q6/CiuljyfPOxvM8fRD9K0UItAxRruzsWkm66lYPV1MWvrv1Mhf1vNElmREmnfccFZ9CTFsiZwJfuXZ2b/f8Pe9FTXhh0ZzD0JEBTCSYnKS5V71oVqH1RvgewRWzRwRwDnAO4gTOAeLyQrCxh/biB02LHq1gVwDksnqjLNE9+HDpjuO+2YmkmmhsvTgL37PnqSb2PiHGWRJSeccg7evLLSu1NTvSIN/N/vGjNzyhiU0gHKHqOXKPZnTUYkJUOnrFF6k+P4lql4Z1ttQCi5o24eDADLScw9t+uRP3pg5VrRZvPnDUVFZvFPr3YJzJSZIAeZXk0mE9Vih3a4z/3rmz00rPVyyrADDkmCmvCCsXVik+IgYxa0mTT7beufobqE1pjB75WphHJ8KKPGj1nKH+luf9xDHWIOkIMXHOwQ4gybckFUCJRWYdzgo1tp59Mga1Q8u6Y1oCrgA4Pe2002SZBD8kz8uRcy4FcG5fX98vT3SS4ahpIg9mRH/RXJ9G3jZR3hlIjHWKVB5A2keSeyqOtGIY90sxc09Au6+OMciRci9wtBtEj487bNpEjT8c3k1J85V5xSw7WCdSvnBHcC7XzcYJNDPubmd43V07sMsaVBUdk04uxLPRWh+scK80sB7t7e19uPzbUd/oRFFNNEbJ9r1rz4a06n3LBt4ZkljrVLFGde5tLmzxnqfsSMBwyiYvx9v7545GNJd09EGn0VGL2pS2f/Tsf/Ln6+MUV7WIy+OgLvePFz4ArAgUEe5sZrjqjt14IBH0ekfnI5fhyTAM5RCNaiXAvyzKVH9lSYbDUk00xsn47++cM9ffPeU87zxuGyseq7xMJm/ezvu4KV9ghZShKisvSd5urotvKSfI0d762KKK48MWtSmdvOrZYzw///eodHtwBciy3xgEcCLQKufkV971AH7YTNCnGFaO3E8uqzcOcUiZZCj172PARRIqwa2+b/7pLtbboPSZaBnrlFJLLBda9Js4gyo8by77XPq28PryGscygmMNGwvGhixqNe5JG39EzfpPEMUaztrCMFiwrJEXHMKKg0eCR9oWr77jEfz9ng76PF1Udx3mZnn1hvE877ALfZ+oMp2jpprk/QLjZPijjZd3uqJ/FlJrJDFWtFZ5swgt/TAg5IxUWHPb/lva2PGfMCIKY8ceFDz2vACRAGPY85oX1mVu/gWcNnYg9BVcycL5j6JgFCAHIwLFCm0hvO0Xj+IvduyGUoyID62XC/HslFL6EFkqKio6f/1JhpzjHK6G9m5sfZDCyqeso9CZ1IniJZy7ZKo6sRSy1kl6T5jseSHGT+9g49EZVfvT8QcCJiYURkdt70c/+fh61+CUJdVPSWJBlD8IFTt1lTeUoicTDOMMLu4K8c5T1+C8mDFnHFyhsxeOL5rW1qxZ0+np6Tlk0xozi7X2wv7+/p/+WizoCVEYZQsIvL/ae6EJuj5OoX4K6tYKiJeLm+Zd2ICzziJgxdY90l9/6PLd1224CyOiMHl82wMcf2avMLpm//Mrf+K3557HDnPwQwWxxW5d+4FbLCkhsPC1wq3zHfzB7ffhpkd3wyOFLqVhRZaIbWa2YRgeqqdJtNaw1s4Q0QPln4/72Y6UasKlC1TbfLn2P966zgRd3yeln0L1zAiROtjy70L5/ssIWUGw06Xm2buv23AXJo4fXGAlQ3m1KY3xYRN97PNPsVHX11OP+tFuWzAVO1kvfzOmQjxbiyd2x/jjdQN4eneA1Dm0bb5sbhj4nVNOOUUj3/TqgGsU7SvcarV+3NfX94RfmQVdE843w86BCG6sPxOk3m3C6MmuZZHbJErlhToH4SUhgwCajXvYJfwcvIl+Ur7LlRjiysZqi4HFN37+wiSOvmY9fz1aTUNgzQIcbKGgPIBDyKwFyOF5A9149Zp+bIp9JCZF2N3XGlw9GOMgBpaI2N7eXjU7O/vl/v7+35UTtMdvcTfCBBjbIWWw3/vEg08UN/gOsBoxrIBOakig8g60AtgS4MXDd2IoZq0Se3fUbF5Zf2vPncdjMS9HKx+ML0AO/mrr6Wn36q9QEF+IRt2g2Hb9UMSFAW6NQ6AZzx2sYKS/yz7/3LPS7q5qNNfuoNzgjWlhEU6IiOnr69Ozs7P/o6+v709lxXfqFsLEJGP7IC3mrGhL88mpwn+BuN8Xv6ql1SyUkOK8vq785DYHiv0HkSfgLLqgueW+H+5q/27rv1YfLsX8yo37RGVbCsOr7y+29NRXr/mki+MXolEv9kQ9/NJDiggGAjEOikmeefIq/NGZ6+iKwVUYjBQy69AxeSVJ8RCmt7dXz83OvrK/v/9Txw+wEGogYJqxaUgWv/STrv9Rpdm99jktFb1GOX6ODSuQdgNwsCCt9q2xXrQaF4qiBBgCJ8oRxUxew30mbe94La49pX0iwM3ve6KoJgv5SvqbL/856/C/ibNAlh4RNxdx93y3l8wCEJzZ04Xnrl+F568dxMX9VfSFESAWSWaEg5AerbcvP/WjP/7+NZe01YcbDYPtIwKMAcUyUftYvvg5NkbAGLBpkrA976zEpl2C0f2qJP7nvWHVBr/VRvwiIfc7rOPTHXlAax4CWJBmgSrWtsnjjUL7OJjKTawEBj60sHM6k7eb1+nr939XK00nNl9adEhgnJy/5UtXZmHwcfL99Wg0bLF202G5mShv2YAQMiuAcYDSOLMrxtNW9+Lpg91y8WA/rQ9V66S+vrVENF802B47bbnV8zFwZk+n9eS9le5hEXU5qfBM+BVI2oHLjGMhAbFyxIVxUa7KW3LuEhHtIEpQgeKOu5ts+lr7+mgaE6IwAnc8fu7h6FeTEC+Nr49MrDGx/yEbBKOSZUCWmdxfPrJxKFJg0rACGOuAzALiwYsCrAt1+nDHfIut/DSC+XkT8f0J651RtnfGD01zLt2Qoi/MxfZMR/f4dT+13bFx3MfaO8k32SkO+pwW9WwCmY3kcLoOu1XKPjjJgKwjArIgxYDHJYdSsczFUnAXxLEAZOFrrQmw1v2NZPxWvIFmVtqYOhj96ioeCr0MAOHWyZemfvgXFISnSLMOiBSBkeVJFgwVgPK1yorlivKXaWwuLFCpgtlDXnpuIKkBnLQBagk4Bek0b71RHoh9AsUAxc6vAirMzQNHIGMhJoUIWUAJAQxhBmlIcW8B5UDKYs4tPrmYtmBPIWZQau6sNNI/abyxkjeJnSB9uxz9aktaRAiTk4zRUdv14U8NtCo9/1WI34DA89FsCsCuQPDAU5G/1H0Mn3MPhBdcJyewEJJ8Z07FBGKQByGNPJCkFkCEEJwQyAny0kHlcsCIwEwQJlCxOUJZWkEaS4Es1krbJ44FAgcohTgAJbYJob/sn7nzvXuuO7/+qxDJ+9Ovp2ZpETfHN37+wiTSfybQI/BCSLsFyvtr1ZKO7nKtH1JL1DeJwj4Lqvh7OQmEAKelWNoPIC05iKByxZG8WiGfAJB8fyhIISVARdu7Xnr9BYu4+N2RgMgCrBHHoHbmQOrTXpa9J31DmCc/foVcu5h+fUVpi7gZAMKbvvh0q/23kHMvzOKIqd0GnDUQsDDxvjU68xXPDwgglC+dFPZlCgmQHJxcrHIB3uL/52JfFiYGFgBekBTkFcfvZ0w5cQALOFSIQlAnySD4UmjtDe3XVW4FgF8H1y6mX3/VYa3GGBvLy3MB9Gz50pMaAb+OrHqJi8M+GAOXdgBHJkeWifItR/LzlwDMENE5zpSLUMEiG44K4Mr1yRZEa/H3gwCci2YGhIod5ZQDsYZfBSkP1GntFqIJbdTHs6uDvHV0QtTiaNevi379AJdUE8YYFoAe+MRnT57jcISdfqkjucRUqkBmgDQFCSyIJV/ZSeWOpqgcbMq5jKAKX3QR59Fi0boIxFKXLkwABUAAUQKwEGuXbwnpKQQxoGNQe14A9X0F/my/e+SLO1975qMAHjPAlvTYAbikWo2xaROVopsAdG/5hyc1fPUCOHkexD3RVbs1hCDG5KC73LgquJiImeCYJC93ogUAUUwAUflnIVmtALBAVJ57zQvgCOQp6Ajkx7kR3awbAv/Qaf66Z+gfstf0/XBh3I8xYEt67AFckghhLF9poPwTAah+4n+d29TeZSRqc5DSkzMlZ2RRlwfWRSVJvp4ILOflQ+Kk5MTFHA4UljIzgX1AeQAXH2jAApw0M9+mv8i8rh8IaJt26S3Za9b/fEmhTW1aYWzI/rp07OHosQvwYqoJA9O8fwpNRkbU6me9+vS9XrhRrLmAhM8TotOVcyezcH/CQRVaKSIPYJ17YFQ0zBXVRGStZUiTyO0VeA8B3r1C3h2E8KcK2e2frr7lF6Ojk4usXwJqTgNwjzVuXY5+MwBeTLUaA0O8bMwY+QO9dssW7186uvfuro29njXdKpUqi40UPIZSIMvOeV47Yd0gpeb7Zc/sZfd/e+6L4+Ppsmw4IQrbpwkY+o0AdTH95gG8lAi1GmHTJsLgIGEaOC5xKUKYBGMQhF2QQqfmBSi/ofSbDvDBKN8PaHG2CEC5R2NOk3lr7BiQdwsAwGNTj/4/+n90UPr/ATnPClXjA2J1AAAAAElFTkSuQmCC";
const AfMark = ({ size = 22 }) => <img src={AF_MARK} alt="AssessFirst" style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }} />;
const AfLogo = ({ size = 15 }) => (
  <span style={{ fontFamily: AF.font, fontWeight: 700, fontSize: size, color: AF.black, letterSpacing: "-0.02em", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}><AfMark size={size * 1.15} />AssessFirst</span>
);
const AfCta = ({ children, onClick, small, disabled, href }) => {
  const st = { background: disabled ? "#F8B9D6" : AF.pink, color: "#fff", fontFamily: AF.font, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.06em", border: "none", borderRadius: 8, padding: small ? "8px 18px" : "12px 26px", fontSize: small ? 11 : 13, cursor: disabled ? "default" : "pointer", textDecoration: "none", display: "inline-block" };
  return href ? <a href={href} target="_blank" rel="noreferrer" style={st}>{children}</a> : <button onClick={disabled ? undefined : onClick} style={st}>{children}</button>;
};
const GhostBtn = ({ children, onClick, small }) => (
  <button onClick={onClick} style={{ background: "#fff", border: `1px solid ${AF.border}`, color: AF.black, borderRadius: 8, padding: small ? "7px 14px" : "11px 22px", fontFamily: AF.font, fontSize: small ? 11 : 12, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>{children}</button>
);
const Chip = ({ children, on, onClick }) => (
  <span onClick={onClick} style={{ fontSize: 11, fontWeight: 500, borderRadius: 14, padding: "5px 11px", cursor: onClick ? "pointer" : "default", background: on ? "#FFF5FA" : AF.grayLight, color: on ? AF.pink : AF.grayMid, border: on ? `1.5px solid ${AF.pink}` : "1.5px solid transparent", display: "inline-block" }}>{children}</span>
);
const Check = ({ size = 18 }) => <span style={{ display: "inline-flex", width: size, height: size, borderRadius: "50%", background: "#12B76A", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: size * 0.6, fontWeight: 700, flexShrink: 0 }}>✓</span>;
const Frame = ({ children, dark, gray }) => (
  <div style={{ background: dark ? AF.black : gray ? AF.grayLight : "#fff", border: dark || gray ? "none" : `1px solid ${AF.border}`, borderRadius: 12, minHeight: 500, padding: "34px 38px", fontFamily: AF.font, boxSizing: "border-box" }}>{children}</div>
);
const Bar = () => <div style={{ height: 4, width: 120, background: AF.gradient, borderRadius: 2, marginBottom: 18 }} />;
const H2 = ({ children, dark }) => <h2 style={{ fontSize: 23, fontWeight: 700, color: dark ? "#fff" : AF.black, letterSpacing: "-0.02em", margin: "0 0 8px" }}>{children}</h2>;
const P = ({ children, dark, max = 680 }) => <p style={{ fontSize: 12.5, color: dark ? "#B9B9BC" : AF.grayMid, margin: "0 0 18px", maxWidth: max, lineHeight: 1.6 }}>{children}</p>;
const Kicker = ({ children }) => <div style={{ fontSize: 10.5, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>{children}</div>;
const LangSwitch = ({ lang, setLang }) => (
  <div style={{ display: "inline-flex", border: `1px solid ${AF.border}`, borderRadius: 8, overflow: "hidden" }}>
    {["en", "fr"].map((k) => <span key={k} onClick={() => setLang(k)} style={{ padding: "4px 11px", fontSize: 10.5, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", background: lang === k ? AF.black : "#fff", color: lang === k ? "#fff" : AF.grayMid }}>{k}</span>)}
  </div>
);
const CurSwitch = ({ cur, setCur }) => (
  <div style={{ display: "inline-flex", border: `1px solid ${AF.border}`, borderRadius: 9, overflow: "hidden" }}>
    {Object.keys(CUR).map((k) => <span key={k} onClick={() => setCur(k)} style={{ padding: "6px 13px", fontSize: 11, fontWeight: 700, cursor: "pointer", background: cur === k ? AF.pink : "#fff", color: cur === k ? "#fff" : AF.grayMid }}>{k}</span>)}
  </div>
);
const Slider = ({ label, value, onChange, min, max, step = 1, suffix = "" }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}><span style={{ color: AF.grayMid }}>{label}</span><b style={{ color: AF.black }}>{value.toLocaleString("en-US")}{suffix}</b></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: AF.pink }} />
  </div>
);
const Seg = ({ options, value, onChange }) => (
  <div style={{ display: "inline-flex", border: `1px solid ${AF.border}`, borderRadius: 9, overflow: "hidden" }}>
    {options.map(([v, l]) => <span key={v} onClick={() => onChange(v)} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", background: value === v ? AF.black : "#fff", color: value === v ? "#fff" : AF.grayMid }}>{l}</span>)}
  </div>
);
const PROD_FR = {
  CVS: ["Analyse de CV", "Analyse automatique · 1 min · Extrait compétences, expériences et formation de chaque CV et classe les candidatures par rapport au poste."],
  SCAN: ["Préqualification IA vocale", "Agent vocal IA · 5 min · Appelle les candidats et valide les critères clés du poste — expérience, salaire, disponibilité, mobilité — avec un score d'adéquation immédiat."],
  SCANT: ["Préqualification IA écrite", "Agent conversationnel IA · 3 min · La même préqualification que SCAN, en conversation écrite — conçue pour les funnels à fort volume, mobile-first."],
  SWIPE: ["Personnalité", "Questionnaire visuel · 5 min · Mesure 20 traits de personnalité (Big Five) — comment une personne travaille, collabore et progresse."],
  DRIVE: ["Motivations", "Énoncés par paires · 8 min · Mesure 20 leviers de motivation — ce qui entretient l'engagement. Un prédicteur de la fidélisation."],
  BRAIN: ["Raisonnement", "Test adaptatif · 8 min · S'ajuste au candidat en temps réel. Évalue le raisonnement, la résolution de problèmes et l'agilité d'apprentissage."],
  VOICE: ["Compétences & langues", "Entretien vocal IA · ~3 min par compétence · Des mises en situation propres au poste valident toute compétence technique ou langue parlée, avec un certificat CECR."],
};
const prodTxt = (p, lang) => lang === "fr" ? { short: PROD_FR[p.id][0], info: PROD_FR[p.id][1] } : { short: p.short, info: p.info };
const ProductTile = ({ p, big, lang = "en" }) => {
  const [hover, setHover] = useState(false);
  const tx = prodTxt(p, lang);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ position: "relative", background: AF.grayLight, borderRadius: 10, padding: big ? 16 : 12, minHeight: big ? 96 : 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: big ? 42 : 34, height: big ? 42 : 34, borderRadius: 9, background: p.grad, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: big ? 18 : 15, color: "#fff", flexShrink: 0 }}>{p.icon}</span>
        <div><div style={{ fontSize: big ? 15 : 13, fontWeight: 700, color: AF.black }}>{p.label}</div><div style={{ fontSize: big ? 11 : 10, color: AF.grayMid }}>{tx.short}</div></div>
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: AF.pink, whiteSpace: "nowrap" }}>{p.cost} tk</span>
      </div>
      {big && <div style={{ fontSize: 11, color: AF.grayMid, lineHeight: 1.45, marginTop: 10 }}>{tx.info.split(" · ").slice(2).join(" ")}</div>}
      {hover && <div style={{ position: "absolute", zIndex: 5, inset: 0, background: "rgba(29,29,31,0.96)", color: "#fff", borderRadius: 10, padding: "10px 14px", fontSize: 11, lineHeight: 1.5, display: "flex", alignItems: "center" }}>{tx.info}</div>}
    </div>
  );
};

/* ============ I18N (narrative layer) ============ */
const L = {
en: {
  nav: { back: "← Back", next: "Next →", restart: "Restart", intro: "Introduction", act: "Act" },
  hdr: { title: "partner journey", sub: "Four partner programmes, one journey: your role, your reward, your tools — and what a year with AssessFirst looks like.",
    acts: { 0: "Welcome", 1: "Your programme", 2: "What you sell", 3: "What you earn", 4: "What comes next" } },
  profiles: [["rpo", "RPO & outsourcing"], ["recruit", "Recruitment & staffing"], ["consult", "HR consulting & training"]],
  welcome: {
    h: "Four ways to earn with AssessFirst. One journey to find yours.",
    p: "AssessFirst helps organisations understand people at work and make better decisions: personality, motivations, reasoning, skills, languages, job fit — one profile, seven tools, used by 3,500+ companies. Whether you introduce us, co-sell with us, resell us or distribute us, there is a programme with a clear role, a clear reward and the tools to deliver. This journey shows you which one fits, and what a year looks like.",
    
    chapters: [["Your programme", "Referral, Advisory, Reseller or Distributor: your role, your reward, your portal and the rules."], ["What you sell", "Seven tools, one token — and what they change in your missions."], ["What you earn", "Commission calculator or price grid, then your year in numbers."], ["What comes next", "Your first 90 days — and how to book a call."]],
    start: "Start the journey →", skip: "Skip to the simulator →",
  },
  why: {
    h: "The HR market is changing. Your clients are feeling it.",
    cols: [["What's happening", [["CVs have real limits", "Less than 15% predictive validity, yet most decisions still rely on them."], ["Mistakes are expensive", "A bad hire costs ~1.5× annual salary; a failed promotion costs a team."], ["Regulation is tightening", "The EU AI Act requires transparency and fairness in AI-based decisions."]]],
      ["The AssessFirst approach", [["A complete view of each person", "Personality, motivations, reasoning, skills and languages: one profile, seven tools."], ["AI where it saves time", "SCAN and VOICE automate pre-qualification and skills interviews."], ["Built for compliance", "Auditable models, bias-tested, GDPR-ready, aligned with the EU AI Act."]]],
      ["What clients see", [["-30%", "hiring mistakes within 6 months"], ["+25%", "performance on key roles within 12 months"], ["4.9/5", "candidate & employee experience · 2,700+ Google reviews"], ["39", "languages · 3,500+ clients in 40+ countries"]]]],
    h2: "What AssessFirst changes in your missions",
    p2: "Three concrete situations where the tools earn their place — and where the margin comes from.",
    use: {
      rpo: [["Pre-qualification at scale", "SCAN calls every applicant and validates the key criteria — your recruiters only handle qualified profiles."], ["Volume hiring, secured", "SWIPE, DRIVE and BRAIN on every shortlist: objective fit, fewer early departures."], ["Prove quality of hire", "Consumption and fit data per client — the KPI your account managers need in reviews."]],
      recruit: [["Sharper shortlists", "Objective data on personality, motivation and reasoning, before the client interview."], ["Faster time-to-hire", "Pre-qualification and skills interviews run without a recruiter on the line."], ["A candidate experience clients remember", "Every candidate receives their own profile — a signature of your firm."]],
      consult: [["Assessment centres, scaled", "The same scientific backbone for every candidate, in 39 languages, in days rather than weeks."], ["Internal mobility & development", "Match people to target roles; feed reviews, coaching and career conversations."], ["Leadership & outplacement", "Complete profiles as the starting point of every individual programme."]],
    },
    pts: [["Sell to your existing base", "An immediate add-on to your services, not a new sales motion."], ["You set the resale price", "Buy at partner price, resell at yours — and bill your services around it."], ["No competition on your accounts", "You own the relationship. Our team supports you and never sells around you."]],
  },
  prog: {
    h: "Reseller or Distributor — pick your programme",
    p: "Two programmes, one back-office. The difference is who onboards and supports your clients — and therefore your discount level.",
    cards: { reseller: ["Reseller", "You sell and renew. AssessFirst trains and onboards your clients.", "Recruitment firms, HR consultancies", "30 → 40 % off the public grid"], distributor: ["Distributor", "You own the full client lifecycle: sale, onboarding, training, level-1 support.", "RPOs, HR service groups, country distributors", "40 → 50 % off the public grid"] },
    compareT: "Who does what", rows: ["Lead generation, demo, closing", "Renewals & upsell", "Client onboarding & training", "Customer success", "Level-1 support (functional)", "Level-2 support (technical)", "Client accounts, allocation, renewals", "Billing", "Discount on public grid"],
    m: { reseller: ["You", "You", "AssessFirst", "AssessFirst", "Shared", "AssessFirst", "You — in your back-office", "AssessFirst invoices you; you invoice your client", "30–40 % by tier"], distributor: ["You", "You", "You", "You", "You", "AssessFirst", "You — in your back-office", "AssessFirst invoices you; you invoice your client", "40–50 % by tier"] },
    you: "You", af: "AssessFirst", shared: "Shared",
    tH: "Tiers & market development funds", tP: "Three tiers reward the recurring revenue you manage across your portfolio (managed ARR, reviewed annually). Higher tier, higher discount — plus market development funds to co-finance events, webinars, content and local campaigns (approved activities, 50% co-investment).",
    tCols: ["Tier", "Managed ARR", "Discount", "MDF / year"],
    tiers: { reseller: [["Core", "New partner", "30 %", "—"], ["Premier", "150K", "35 %", "up to €2,500"], ["Elite", "300K", "40 %", "up to €5,000"]], distributor: [["Core", "New partner", "40 %", "—"], ["Premier", "250K", "45 %", "up to €7,500"], ["Elite", "500K", "50 %", "up to €15,000"]] },
    tNote: "Indicative programme structure — final terms are set in your partnership agreement.",
  },
  sell: {
    h: "Seven tools. One token.", p: "Your clients buy an annual subscription with a number of tokens; every assessment consumes tokens. Hover a tool to see what it does.",
    note: "Each source enriches the others: combined, they give recruiters and managers a reliable, actionable view of every person. Every candidate or employee receives their own profile. The full suite on one person = 100 tokens exactly.",
    h2: "Your margin: tokens you resell, services you deliver.",
    p2: "You buy tokens at your partner price and resell an annual subscription at the price you decide. Around it, you sell what you know best — that second line is often the larger one.",
    tokT: "Token resale", tok: ["Partner price = public grid − your tier discount", "Resale price = yours, per client", "Each renewal is a new order — revenue compounds year after year"],
    servT: "Services you bill on top", serv: ["Setup & job-model configuration", "Recruiter & manager training", "Candidate and employee debriefs", "Assessment centres & mobility programmes", "Coaching, competency frameworks, change"],
    foot: "Figures come later, in the simulator — built on your own portfolio.",
  },
},
fr: {
  nav: { back: "← Retour", next: "Suivant →", restart: "Recommencer", intro: "Introduction", act: "Acte" },
  hdr: { title: "parcours partenaire", sub: "Quatre programmes partenaires, un parcours : votre rôle, votre rémunération, vos outils — et à quoi ressemble une année avec AssessFirst.",
    acts: { 0: "Bienvenue", 1: "Votre programme", 2: "Ce que vous vendez", 3: "Ce que vous gagnez", 4: "Et ensuite" } },
  profiles: [["rpo", "RPO & externalisation"], ["recruit", "Recrutement & staffing"], ["consult", "Conseil RH & formation"]],
  welcome: {
    h: "Quatre façons de gagner avec AssessFirst. Un parcours pour trouver la vôtre.",
    p: "AssessFirst aide les organisations à comprendre les personnes au travail et à prendre de meilleures décisions : personnalité, motivations, raisonnement, compétences, langues, adéquation au poste — un profil, sept outils, utilisés par 3 500+ entreprises. Que vous nous présentiez, vendiez avec nous, nous revendiez ou nous distribuiez, il existe un programme avec un rôle clair, une rémunération claire et les outils pour délivrer. Ce parcours vous montre lequel vous correspond, et à quoi ressemble une année.",
    
    chapters: [["Votre programme", "Referral, Advisory, Revendeur ou Distributeur : votre rôle, votre rémunération, votre portail et les règles."], ["Ce que vous vendez", "Sept outils, un token — et ce qu'ils changent dans vos missions."], ["Ce que vous gagnez", "Calculateur de commission ou grille tarifaire, puis votre année en chiffres."], ["Et ensuite", "Vos 90 premiers jours — et comment prendre rendez-vous."]],
    start: "Démarrer le parcours →", skip: "Aller au simulateur →",
  },
  why: {
    h: "Le marché RH change. Vos clients le ressentent.",
    cols: [["Le constat", [["Le CV ne suffit plus", "Moins de 15 % de validité prédictive, et pourtant la plupart des décisions reposent encore dessus."], ["Une erreur de recrutement coûte cher", "En moyenne 1,5 fois le salaire annuel ; une promotion ratée, c'est une équipe entière qui décroche."], ["La réglementation se durcit", "L'EU AI Act impose transparence et équité dans toute décision assistée par l'IA."]]],
      ["La réponse AssessFirst", [["Une vision complète de chaque personne", "Personnalité, motivations, raisonnement, compétences et langues : un seul profil, sept outils."], ["L'IA pour gagner du temps", "SCAN et VOICE automatisent la préqualification et les entretiens de compétences."], ["Conforme par conception", "Modèles auditables, testés contre les biais, conformes au RGPD et à l'EU AI Act."]]],
      ["Les résultats chez nos clients", [["-30 %", "d'erreurs de recrutement en 6 mois"], ["+25 %", "de performance sur les postes clés en 12 mois"], ["4,9/5", "satisfaction candidats et collaborateurs · 2 700+ avis Google"], ["39", "langues · 3 500+ clients dans plus de 40 pays"]]]],
    h2: "Ce qu'AssessFirst change dans vos missions",
    p2: "Trois situations concrètes où les outils gagnent leur place — et d'où vient la marge.",
    use: {
      rpo: [["Préqualification à grande échelle", "SCAN appelle chaque candidat et valide les critères clés — vos recruteurs ne traitent que des profils qualifiés."], ["Recrutement en volume, sécurisé", "SWIPE, DRIVE et BRAIN sur chaque shortlist : adéquation objective, moins de départs précoces."], ["Prouvez la qualité des embauches", "Données de consommation et d'adéquation par client — le KPI qu'attendent vos account managers en revue."]],
      recruit: [["Des shortlists plus justes", "Des données objectives sur la personnalité, la motivation et le raisonnement, avant l'entretien client."], ["Un time-to-hire plus court", "Préqualification et entretiens de compétences sans recruteur au téléphone."], ["Une expérience candidat mémorable", "Chaque candidat reçoit son propre profil — une signature de votre cabinet."]],
      consult: [["Des assessment centers à l'échelle", "Le même socle scientifique pour chaque candidat, en 39 langues, en jours plutôt qu'en semaines."], ["Mobilité interne & développement", "Rapprochez les personnes des postes cibles ; alimentez revues, coaching et entretiens de carrière."], ["Leadership & outplacement", "Des profils complets comme point de départ de chaque programme individuel."]],
    },
    pts: [["Vendez à vos clients existants", "Un complément immédiat à vos prestations, pas un nouveau cycle de vente à construire."], ["Vous fixez le prix de revente", "Achetez au prix partenaire, revendez au vôtre — et facturez vos services autour."], ["Aucune concurrence sur vos comptes", "La relation client est la vôtre. Notre équipe vous appuie et ne vend jamais à votre place."]],
  },
  prog: {
    h: "Revendeur ou Distributeur — choisissez votre programme",
    p: "Deux programmes, un seul back-office. Ce qui change : qui prend en charge le démarrage et le support de vos clients — et donc votre niveau de remise.",
    cards: { reseller: ["Revendeur", "Vous vendez et renouvelez ; AssessFirst forme vos clients et les accompagne au démarrage.", "Cabinets de recrutement, cabinets de conseil RH", "30 → 40 % sur la grille publique"], distributor: ["Distributeur", "Vous prenez en charge tout le cycle client : vente, démarrage, formation, support de niveau 1.", "RPO, groupes de services RH, distributeurs pays", "40 → 50 % sur la grille publique"] },
    compareT: "Qui fait quoi", rows: ["Prospection, démo, signature", "Renouvellements & ventes additionnelles", "Démarrage & formation des clients", "Suivi de la satisfaction client", "Support de niveau 1 (fonctionnel)", "Support de niveau 2 (technique)", "Comptes clients, allocation, renouvellements", "Facturation", "Remise sur la grille publique"],
    m: { reseller: ["Vous", "Vous", "AssessFirst", "AssessFirst", "Partagé", "AssessFirst", "Vous — dans votre back-office", "AssessFirst vous facture ; vous facturez votre client", "30–40 % selon le tier"], distributor: ["Vous", "Vous", "Vous", "Vous", "Vous", "AssessFirst", "Vous — dans votre back-office", "AssessFirst vous facture ; vous facturez votre client", "40–50 % selon le tier"] },
    you: "Vous", af: "AssessFirst", shared: "Partagé",
    tH: "Tiers & fonds de développement marché", tP: "Trois tiers récompensent le revenu récurrent que vous gérez sur votre portefeuille (ARR géré, révisé chaque année). Plus le tier est élevé, plus la remise l'est — avec des fonds de développement marché pour cofinancer événements, webinaires, contenus et campagnes locales (activités approuvées, co-investissement 50 %).",
    tCols: ["Tier", "ARR géré", "Remise", "MDF / an"],
    tiers: { reseller: [["Core", "Nouveau partenaire", "30 %", "—"], ["Premier", "150K", "35 %", "jusqu'à 2 500 €"], ["Elite", "300K", "40 %", "jusqu'à 5 000 €"]], distributor: [["Core", "Nouveau partenaire", "40 %", "—"], ["Premier", "250K", "45 %", "jusqu'à 7 500 €"], ["Elite", "500K", "50 %", "jusqu'à 15 000 €"]] },
    tNote: "Structure de programme indicative — les conditions finales sont fixées dans votre contrat de partenariat.",
  },
  sell: {
    h: "Sept outils. Un seul token.", p: "Vos clients souscrivent un abonnement annuel incluant un volume de tokens ; chaque évaluation en consomme. Survolez un outil pour en savoir plus.",
    note: "Chaque source enrichit les autres : combinées, elles donnent aux recruteurs et aux managers une vision fiable et actionnable de chaque personne. Chaque candidat ou collaborateur reçoit son propre profil. La suite complète sur une personne = 100 tokens exactement.",
    h2: "Votre marge : les tokens que vous revendez et les services que vous facturez.",
    p2: "Vous achetez les tokens au prix partenaire et revendez un abonnement annuel au prix que vous décidez. Autour, vous vendez ce que vous savez faire — cette seconde ligne de revenus est souvent la plus importante.",
    tokT: "Revente des tokens", tok: ["Prix partenaire = grille publique − remise de votre tier", "Prix de revente = le vôtre, par client", "Les renouvellements se cumulent année après année"],
    servT: "Services facturés en plus", serv: ["Paramétrage & modèles de postes", "Formation des recruteurs et managers", "Restitutions candidats et collaborateurs", "Assessment centers & programmes de mobilité", "Coaching, référentiels de compétences, conduite du changement"],
    foot: "Les chiffres viennent plus tard, dans le simulateur — construit sur votre propre portefeuille.",
  },
},
};


/* ============ PROGRAMMES ============ */
const PROGS = ["referral", "advisory", "reseller", "distributor"];
const isResell = (p) => p === "reseller" || p === "distributor";
const isComm = (p) => p === "referral" || p === "advisory";
const COMM = { referral: [20, 0], advisory: [25, 15] }; // % year 1, % renewals

L.en.pg = {
  h: "Pick your programme", p: "One programme at a time, four clear roles. Choose the one that matches how you work with your clients today.",
  pick: "Continue with",
  cards: {
    referral: ["Referral", "You introduce a qualified contact. An AssessFirst salesperson runs the sale.", ["Introduce by email, declare the lead in the portal", "No demo, no contract, no support on your side", "Commission once the client has paid"]],
    advisory: ["Advisory", "You co-sell with AssessFirst, using your expertise and your client's trust.", ["You qualify, join the demos and weigh on the decision", "AssessFirst contracts, onboards and supports", "Commission on the first year and on renewals you help secure"]],
    reseller: ["Reseller", "You sell and renew AssessFirst subscriptions to your clients.", ["You own the sale, the renewal and the upsell", "An AssessFirst CSM onboards your client with you", "Tiers, MDF and an annual objective"]],
    distributor: ["Distributor", "You run the full client lifecycle on your market.", ["Sale, onboarding, user follow-up, level-1 support", "AssessFirst on level-2 support only", "Tiers, MDF and an annual objective"]],
  },
  detailT: "How it works, in practice",
  rowsComm: ["Lead generation", "Demo & closing", "Renewals & upsell", "Client onboarding & training", "Customer success", "Level-1 support", "Level-2 support", "Who contracts with the client", "Your reward", "Paid", "Incentives"],
  rowsResell: ["Lead generation", "Demo & closing", "Renewals & upsell", "Client onboarding & training", "Customer success", "Level-1 support", "Level-2 support", "Who contracts with the client", "Your reward", "Paid", "Annual objective", "Tiers & MDF"],
  m: {
    referral: ["You", "AssessFirst", "AssessFirst", "AssessFirst", "AssessFirst", "AssessFirst", "AssessFirst", "AssessFirst", "20 % commission on year-1 revenue", "Once the client has paid, on your invoice", "Yes — planned over the year"],
    advisory: ["You", "AssessFirst · you join", "AssessFirst · you contribute", "AssessFirst", "AssessFirst", "Shared", "AssessFirst", "AssessFirst", "25 % of year 1 + 15 % on renewals", "Once the client has paid, on your invoice", "Yes — planned over the year"],
    reseller: ["You", "You", "You", "AssessFirst CSM · with you", "AssessFirst", "Shared", "AssessFirst", "You", "30–40 % discount on the public grid", "You invoice your client", "1 new client per year", "3 tiers · MDF from Premier"],
    distributor: ["You", "You", "You", "You", "You", "You", "AssessFirst", "You", "40–50 % discount on the public grid", "You invoice your client", "1 new client per year", "3 tiers · MDF from Premier"],
  },
  you: "You", af: "AssessFirst",
  advNote: "The 15 % on renewals applies when you stay actively involved with the client during the contract and work the renewal with the AssessFirst Account Manager.",
  sharedNote: "Shared level-1 support: you answer your clients; the AssessFirst CSM backs you up.",
};
L.fr.pg = {
  h: "Choisissez votre programme", p: "Un programme à la fois, quatre rôles clairs. Choisissez celui qui correspond à votre façon de travailler avec vos clients aujourd'hui.",
  pick: "Continuer avec",
  cards: {
    referral: ["Referral", "Vous présentez un contact qualifié. Un commercial AssessFirst mène la vente.", ["Mise en relation par email, lead déclaré dans le portail", "Ni démo, ni contrat, ni support de votre côté", "Commission une fois le client encaissé"]],
    advisory: ["Advisory", "Vous vendez avec AssessFirst, grâce à votre expertise et à la confiance de votre client.", ["Vous qualifiez, participez aux démos et pesez sur la décision", "AssessFirst contractualise, onboarde et supporte", "Commission sur la première année et sur les renouvellements que vous aidez à sécuriser"]],
    reseller: ["Revendeur", "Vous vendez et renouvelez les abonnements AssessFirst de vos clients.", ["Vous portez la vente, le renouvellement et l'upsell", "Un CSM AssessFirst onboarde votre client avec vous", "Tiers, MDF et un objectif annuel"]],
    distributor: ["Distributeur", "Vous prenez en charge tout le cycle client sur votre marché.", ["Vente, démarrage, suivi des utilisateurs, support de niveau 1", "AssessFirst en support de niveau 2 uniquement", "Tiers, MDF et un objectif annuel"]],
  },
  detailT: "Concrètement, comment ça marche",
  rowsComm: ["Génération de leads", "Démo & signature", "Renouvellements & upsell", "Démarrage & formation du client", "Suivi de la satisfaction client", "Support de niveau 1", "Support de niveau 2", "Qui contractualise avec le client", "Votre rémunération", "Paiement", "Incentives"],
  rowsResell: ["Génération de leads", "Démo & signature", "Renouvellements & upsell", "Démarrage & formation du client", "Suivi de la satisfaction client", "Support de niveau 1", "Support de niveau 2", "Qui contractualise avec le client", "Votre rémunération", "Paiement", "Objectif annuel", "Tiers & MDF"],
  m: {
    referral: ["Vous", "AssessFirst", "AssessFirst", "AssessFirst", "AssessFirst", "AssessFirst", "AssessFirst", "AssessFirst", "20 % de commission sur le CA de l'année 1", "Une fois le client encaissé, à réception de votre facture", "Oui — prévus dans l'année"],
    advisory: ["Vous", "AssessFirst · vous participez", "AssessFirst · vous contribuez", "AssessFirst", "AssessFirst", "Partagé", "AssessFirst", "AssessFirst", "25 % de l'année 1 + 15 % sur les renouvellements", "Une fois le client encaissé, à réception de votre facture", "Oui — prévus dans l'année"],
    reseller: ["Vous", "Vous", "Vous", "CSM AssessFirst · avec vous", "AssessFirst", "Partagé", "AssessFirst", "Vous", "30–40 % de remise sur la grille publique", "Vous facturez votre client", "1 nouveau client par an", "3 tiers · MDF dès Premier"],
    distributor: ["Vous", "Vous", "Vous", "Vous", "Vous", "Vous", "AssessFirst", "Vous", "40–50 % de remise sur la grille publique", "Vous facturez votre client", "1 nouveau client par an", "3 tiers · MDF dès Premier"],
  },
  you: "Vous", af: "AssessFirst",
  advNote: "Les 15 % sur les renouvellements s'appliquent si vous restez activement impliqué auprès du client pendant le contrat et travaillez le renouvellement avec l'Account Manager AssessFirst.",
  sharedNote: "Support de niveau 1 partagé : vous répondez à vos clients, le CSM AssessFirst vous appuie.",
};
const pgName = (lang, p) => L[lang].pg.cards[p][0];

/* ============ ACT 0 — WELCOME ============ */
const S_Welcome = ({ goto, lang, steps }) => {
  const T = L[lang].welcome;
  return (
    <Frame>
      <AfMark size={54} />
      <div style={{ height: 4, width: 120, background: AF.gradient, borderRadius: 2, margin: "16px 0" }} />
      <h2 style={{ fontSize: 26, fontWeight: 700, color: AF.black, letterSpacing: "-0.02em", margin: "0 0 10px", maxWidth: 680 }}>{T.h}</h2>
      <p style={{ fontSize: 13, color: AF.grayMid, lineHeight: 1.65, margin: "0 0 28px", maxWidth: 760 }}>{T.p}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 26 }}>
        {T.chapters.map(([t, d], k) => (
          <div key={t} onClick={() => goto(steps.findIndex((st) => st.act === k + 1))} style={{ border: `1px solid ${AF.border}`, borderRadius: 12, padding: 14, cursor: "pointer" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: AF.pink, color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>{k + 1}</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: AF.black, lineHeight: 1.3, marginBottom: 5 }}>{t}</div>
            <div style={{ fontSize: 10.5, color: AF.grayMid, lineHeight: 1.45 }}>{d}</div>
          </div>))}
      </div>
      <AfCta onClick={() => goto(1)}>{T.start}</AfCta>
    </Frame>
  );
};

/* ============ ACT 1 — PROGRAMME ============ */
const S_Choose = ({ lang, prog, setProg, next }) => {
  const T = L[lang].pg;
  return (<Frame><Bar /><H2>{T.h}</H2><P>{T.p}</P>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
      {PROGS.map((id) => { const [n, d, pts] = T.cards[id]; const on = prog === id; return (
        <div key={id} onClick={() => setProg(id)} style={{ border: on ? `2px solid ${AF.pink}` : `1px solid ${AF.border}`, background: on ? "#FFF5FA" : "#fff", borderRadius: 12, padding: "16px 16px", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ width: 15, height: 15, borderRadius: "50%", border: on ? `5px solid ${AF.pink}` : `2px solid ${AF.border}`, flexShrink: 0 }} /><b style={{ fontSize: 16, color: AF.black }}>{n}</b></div>
          <div style={{ fontSize: 12, color: AF.black, lineHeight: 1.5, marginBottom: 10, minHeight: 54 }}>{d}</div>
          {pts.map((p) => <div key={p} style={{ fontSize: 11, color: AF.grayMid, lineHeight: 1.45, padding: "6px 0", borderTop: `1px solid ${AF.border}` }}>{p}</div>)}
        </div>); })}
    </div>
    <AfCta onClick={next}>{T.pick} {pgName(lang, prog)} →</AfCta>
  </Frame>);
};
const Cell = ({ v, T }) => {
  const [a, b] = v.split(" · ");
  const col = (x) => x.startsWith(T.you) ? AF.pink : x.startsWith(T.af) ? "#0096FF" : AF.black;
  return <span style={{ fontWeight: 600, color: col(a) }}>{a}{b && <span style={{ color: AF.pink, fontWeight: 600 }}> · {b}</span>}</span>;
};
const S_Detail = ({ lang, prog }) => {
  const T = L[lang].pg; const rows = isResell(prog) ? T.rowsResell : T.rowsComm;
  const [n, d] = T.cards[prog]; const reward = T.m[prog][8];
  return (<Frame><Bar /><H2>{n} — {T.detailT}</H2><P>{d}</P>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
      <div style={{ border: `1px solid ${AF.border}`, borderRadius: 12, overflow: "hidden" }}>
        {rows.map((r, i) => <div key={r} style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", columnGap: 20, padding: "8px 14px", borderTop: i ? `1px solid ${AF.border}` : "none", fontSize: 12, lineHeight: 1.4, alignItems: "center", background: i >= 8 ? "#FAFAFA" : "#fff" }}><span style={{ color: AF.grayMid }}>{r}</span>{i >= 8 ? <span style={{ fontWeight: 600, color: AF.black }}>{T.m[prog][i]}</span> : <Cell v={T.m[prog][i]} T={T} />}</div>)}
      </div>
      <div>
        <div style={{ border: `2px solid ${AF.pink}`, borderRadius: 12, padding: "16px 18px", background: "#FFF5FA", marginBottom: 10 }}><div style={{ fontSize: 10, color: AF.pink, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{rows[8]}</div><div style={{ fontSize: 17, fontWeight: 700, color: AF.black, lineHeight: 1.3 }}>{reward}</div>{prog === "advisory" && <div style={{ fontSize: 10.5, color: AF.grayMid, lineHeight: 1.45, marginTop: 8 }}>{T.advNote}</div>}</div>
        {(prog === "advisory" || prog === "reseller") && <div style={{ background: AF.grayLight, borderRadius: 12, padding: "12px 14px", fontSize: 11.5, color: AF.grayMid, lineHeight: 1.5 }}>{T.sharedNote}</div>}
      </div>
    </div>
  </Frame>);
};

/* ============ ACT 2b — WHAT IT CHANGES (per profile, chips) ============ */
const S_Fit = ({ lang, profile, setProfile }) => {
  const T = L[lang].why;
  return (<Frame><Bar /><H2>{T.h2}</H2><P>{T.p2}</P>
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>{L[lang].profiles.map(([id, t]) => <Chip key={id} on={profile === id} onClick={() => setProfile(id)}>{t}</Chip>)}</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
      {T.use[profile].map(([a, b]) => <div key={a} style={{ border: `1px solid ${AF.border}`, borderRadius: 12, padding: "16px 18px" }}><div style={{ fontSize: 15, fontWeight: 700, color: AF.black, marginBottom: 8 }}>{a}</div><div style={{ fontSize: 12, color: AF.grayMid, lineHeight: 1.55 }}>{b}</div></div>)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>{T.cols[2][1].map(([v, l]) => <div key={l} style={{ background: AF.grayLight, borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 22, fontWeight: 800, color: AF.pink }}>{v}</div><div style={{ fontSize: 10.5, color: AF.grayMid, lineHeight: 1.4 }}>{l}</div></div>)}</div>
  </Frame>);
};

/* ============ ACT 1c — YOUR REWARD (referral / advisory) ============ */
L.en.earn = {
  referral: { h: "Your reward: 20 % of what your introduction becomes", p: "You introduce a qualified contact by email and declare the lead in the portal. AssessFirst validates it, then sells, contracts and onboards. You receive 20 % of the revenue invoiced in year 1, once the client has paid.", a: ["A warm introduction, not a cold lead", "Commission on the full year-1 contract, whatever its size", "Incentives planned over the year, on top"], b: ["Nothing to deliver, nothing to support", "No annual objective", "You follow every lead's stage in the portal"] },
  advisory: { h: "Your reward: 25 % in year 1, 15 % on every renewal", p: "You qualify the need, join the demos and weigh on the decision with your expertise. AssessFirst contracts, onboards and supports. You earn on the first contract and on each renewal you help secure.", a: ["25 % of year-1 revenue", "15 % of each renewal — if you stay involved and work it with the Account Manager", "Incentives planned over the year, on top"], b: ["No contract, no support, no billing on your side", "No annual objective", "An AssessFirst expert joins your demos"] },
};
L.fr.earn = {
  referral: { h: "Votre rémunération : 20 % de ce que devient votre mise en relation", p: "Vous présentez un contact qualifié par email et déclarez le lead dans le portail. AssessFirst le valide, puis vend, contractualise et onboarde. Vous recevez 20 % du chiffre d'affaires facturé l'année 1, une fois le client encaissé.", a: ["Une mise en relation chaude, pas un lead froid", "Commission sur tout le contrat de l'année 1, quelle que soit sa taille", "Des incentives prévus dans l'année, en plus"], b: ["Rien à délivrer, rien à supporter", "Aucun objectif annuel", "Vous suivez l'avancement de chaque lead dans le portail"] },
  advisory: { h: "Votre rémunération : 25 % l'année 1, 15 % à chaque renouvellement", p: "Vous qualifiez le besoin, participez aux démos et pesez sur la décision grâce à votre expertise. AssessFirst contractualise, onboarde et supporte. Vous gagnez sur le premier contrat et sur chaque renouvellement que vous aidez à sécuriser.", a: ["25 % du chiffre d'affaires de l'année 1", "15 % de chaque renouvellement — si vous restez impliqué et le travaillez avec l'Account Manager", "Des incentives prévus dans l'année, en plus"], b: ["Ni contrat, ni support, ni facturation de votre côté", "Aucun objectif annuel", "Un expert AssessFirst vous rejoint en démo"] },
};
const S_Reward = ({ lang, prog }) => {
  const T = L[lang].earn[prog];
  return (<Frame><Bar /><H2>{T.h}</H2><P>{T.p}</P>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ border: `2px solid ${AF.pink}`, borderRadius: 12, padding: "18px 20px", background: "#FFF5FA" }}>{T.a.map((t) => <div key={t} style={{ display: "flex", gap: 8, fontSize: 12.5, color: AF.black, marginBottom: 10, lineHeight: 1.45 }}><Check size={15} />{t}</div>)}</div>
      <div style={{ border: `1px solid ${AF.border}`, borderRadius: 12, padding: "18px 20px" }}>{T.b.map((t) => <div key={t} style={{ display: "flex", gap: 8, fontSize: 12.5, color: AF.black, marginBottom: 10, lineHeight: 1.45 }}><span style={{ color: AF.pink }}>·</span>{t}</div>)}</div>
    </div>
  </Frame>);
};

/* ============ ACT 1e — LEADS & COMMISSIONS IN THE PORTAL (referral / advisory, illustrative) ============ */
L.en.leads = {
  h: "Your leads and your commissions, in the same portal", p: "No back-office to run. You declare a lead, AssessFirst validates it, you follow its stage and the commission it will trigger — in the Leads and Deals tabs of your portal.",
  tabs: ["Welcome", "Action Plan", "Training", "Resources", "Leads", "Deals", "Win", "Dashboard"],
  cols: ["Company", "Contact", "Declared", "Status", "Stage", "Est. year-1 ARR", "Your commission"],
  stages: ["Declared", "Validated", "Demo", "Proposal", "Won"], status: ["Pending validation", "Validated · protected"],
  kpi: ["Open leads", "Won this year", "Commission earned", "Commission pending"],
  note: "Commission = 20 % of year-1 revenue (Referral) · 25 % + 15 % on renewals (Advisory). Paid once the client has paid, on your invoice.",
};
L.fr.leads = {
  h: "Vos leads et vos commissions, dans le même portail", p: "Aucun back-office à gérer. Vous déclarez un lead, AssessFirst le valide, vous suivez son avancement et la commission qu'il déclenchera — dans les onglets Leads et Deals de votre portail.",
  tabs: ["Accueil", "Plan d'action", "Formation", "Ressources", "Leads", "Deals", "Win", "Dashboard"],
  cols: ["Entreprise", "Contact", "Déclaré le", "Statut", "Étape", "ARR année 1 estimé", "Votre commission"],
  stages: ["Déclaré", "Validé", "Démo", "Proposition", "Gagné"], status: ["En attente de validation", "Validé · protégé"],
  kpi: ["Leads ouverts", "Gagnés cette année", "Commission acquise", "Commission en attente"],
  note: "Commission = 20 % du CA année 1 (Referral) · 25 % + 15 % sur renouvellements (Advisory). Versée une fois le client encaissé, à réception de votre facture.",
};
const LEADS = [["Nordwind Retail", "C. Martin, CHRO", "2026-06-02", 4, 14400], ["Helix Biotech", "A. Rossi, TA Lead", "2026-09-18", 3, 9000], ["Solano Energy", "M. Diaz, HRD", "2026-10-01", 2, 21600], ["Orbis Consulting", "J. Dupont, CEO", "2026-10-09", 1, 7200], ["Lumen Insurance", "P. Weber, HR Ops", "2026-10-13", 0, 10800]];
const S_Leads = ({ lang, prog }) => {
  const T = L[lang].leads; const rate = COMM[prog][0] / 100;
  const won = LEADS.filter((l) => l[3] === 4), earned = won.reduce((s, l) => s + l[4] * rate, 0), pending = LEADS.filter((l) => l[3] > 0 && l[3] < 4).reduce((s, l) => s + l[4] * rate, 0);
  return (<Frame><Bar /><H2>{T.h}</H2><P>{T.p}</P>
    <div style={{ border: `1px solid ${AF.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 32px rgba(20,30,40,0.10)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 14px", height: 46, borderBottom: `1px solid ${AF.border}` }}>
        <AfMark size={22} />{T.tabs.map((n, i) => <span key={n} style={{ fontSize: 11, padding: "6px 10px", borderRadius: 7, color: i === 4 ? "#fff" : AF.black, background: i === 4 ? "#3B7BFF" : "transparent", marginLeft: i === 0 ? 8 : 0 }}>{n}</span>)}
        <span style={{ marginLeft: "auto", fontSize: 9.5, color: AF.grayMid, textAlign: "right", lineHeight: 1.2 }}>Partner tier<br /><b style={{ fontSize: 12, color: AF.black }}>{pgName(lang, prog)}</b></span><span style={{ width: 24, height: 24, borderRadius: 12, background: AF.gradient, marginLeft: 10 }} />
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>{[[T.kpi[0], LEADS.filter((l) => l[3] < 4).length], [T.kpi[1], won.length], [T.kpi[2], "€" + fmtN(earned)], [T.kpi[3], "€" + fmtN(pending)]].map(([k, v]) => <Kpi key={k} t={k} v={v} />)}</div>
        <div style={{ border: `1px solid ${AF.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.3fr .8fr 1.2fr 1.4fr 1fr 1fr", padding: "6px 14px", background: AF.grayLight, fontSize: 10, color: AF.grayMid, textTransform: "uppercase" }}>{T.cols.map((c) => <span key={c}>{c}</span>)}</div>
          {LEADS.map(([n, ct, d, st, arr]) => <div key={n} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.3fr .8fr 1.2fr 1.4fr 1fr 1fr", padding: "9px 14px", borderTop: `1px solid ${AF.border}`, fontSize: 12, alignItems: "center" }}><b>{n}</b><span style={{ color: AF.grayMid }}>{ct}</span><span style={{ color: AF.grayMid }}>{d}</span><span style={{ fontSize: 10, fontWeight: 600, color: st === 0 ? "#B54708" : "#12B76A", background: st === 0 ? "#FFF6E6" : "#E7F8F0", borderRadius: 8, padding: "3px 8px", justifySelf: "start" }}>{st === 0 ? T.status[0] : T.status[1]}</span><span style={{ display: "flex", gap: 3 }}>{T.stages.map((s, k) => <span key={s} title={s} style={{ height: 6, flex: 1, borderRadius: 3, background: k <= st ? (st === 4 ? "#12B76A" : AF.pink) : AF.grayLight }} />)}</span><span>€{fmtN(arr)}</span><b style={{ color: st === 4 ? "#12B76A" : st === 0 ? AF.grayMid : AF.black }}>{st === 0 ? "—" : "€" + fmtN(arr * rate)}</b></div>)}
        </div>
        <div style={{ fontSize: 10.5, color: AF.grayMid, lineHeight: 1.5, marginTop: 12 }}>{T.note}</div>
      </div>
    </div>
  </Frame>);
};
/* ============ ACT 3b — COMMISSION CALCULATOR & YEAR (referral / advisory) ============ */
L.en.calc = {
  h: "What one client earns you", p: "Pick what your client would buy. The public grid gives the year-1 revenue; your commission follows.", h2: "Your year", p2: "Introductions, conversion, average deal — every figure is yours to change.",
  tokens: "Tokens", commit: "Commitment", size: "Client size", pub: "Year-1 revenue (public grid)", c1: "Your commission, year 1", cr: "Your commission, each renewal",
  intros: "Introductions per year", conv: "Conversion to signed client", avg: "Average year-1 ARR", renew: "Clients still active in year 2", out: ["Clients signed", "Year-1 commission", "Renewal commission / year", "Total over 3 years"], outRef: ["Clients signed", "Year-1 commission", "Average per client", "Total for the year"],
  cta: "Discuss this business case",
};
L.fr.calc = {
  h: "Ce qu'un client vous rapporte", p: "Choisissez ce que votre client achèterait. La grille publique donne le chiffre d'affaires de l'année 1 ; votre commission en découle.", h2: "Votre année", p2: "Mises en relation, conversion, panier moyen — chaque chiffre est modifiable.",
  tokens: "Tokens", commit: "Engagement", size: "Taille du client", pub: "CA année 1 (grille publique)", c1: "Votre commission, année 1", cr: "Votre commission, à chaque renouvellement",
  intros: "Mises en relation par an", conv: "Conversion en client signé", avg: "ARR moyen année 1", renew: "Clients encore actifs en année 2", out: ["Clients signés", "Commission année 1", "Commission renouvellements / an", "Total sur 3 ans"], outRef: ["Clients signés", "Commission année 1", "Moyenne par client", "Total sur l'année"],
  cta: "Discuter de ce business case",
};
const S_Commission = ({ lang, prog }) => {
  const T = L[lang].calc; const [cur, setCur] = useState("EUR"); const { s: sym, r } = CUR[cur];
  const [i, setI] = useState(2), [m, setM] = useState(12), [sz, setSz] = useState("250-1000");
  const tk = PRICE[i][0], pub = publicPrice(tk, m, sz) / (m / 12), [c1, cr] = COMM[prog];
  const money = (n) => sym + fmtN(n * r);
  return (<Frame><Bar /><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><H2>{T.h}</H2><CurSwitch cur={cur} setCur={setCur} /></div><P>{T.p}</P>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: AF.grayLight, borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}><span style={{ color: AF.grayMid }}>{T.tokens}</span><b>{fmtN(tk)} tk</b></div>
        <input type="range" min={0} max={14} value={i} onChange={(e) => setI(Number(e.target.value))} style={{ width: "100%", accentColor: AF.pink, marginBottom: 14 }} />
        <div style={{ fontSize: 11, color: AF.grayMid, marginBottom: 6 }}>{T.commit}</div><div style={{ marginBottom: 12 }}><Seg value={m} onChange={setM} options={[[12, "12 m"], [24, "24 m"], [36, "36 m"], [48, "48 m"]]} /></div>
        <div style={{ fontSize: 11, color: AF.grayMid, marginBottom: 6 }}>{T.size}</div><Seg value={sz} onChange={setSz} options={[["<250", "< 250"], ["250-1000", "250–1,000"], [">1000", "> 1,000"]]} />
      </div>
      <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
        <div style={{ border: `1px solid ${AF.border}`, borderRadius: 10, padding: "12px 16px" }}><div style={{ fontSize: 10, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{T.pub}</div><div style={{ fontSize: 24, fontWeight: 800 }}>{money(pub)}</div></div>
        <div style={{ border: `2px solid ${AF.pink}`, borderRadius: 10, padding: "12px 16px", background: "#FFF5FA" }}><div style={{ fontSize: 10, color: AF.pink, textTransform: "uppercase", letterSpacing: "0.05em" }}>{T.c1} · {c1} %</div><div style={{ fontSize: 28, fontWeight: 800, color: AF.pink }}>{money(pub * c1 / 100)}</div></div>
        {cr > 0 && <div style={{ border: `1px solid ${AF.border}`, borderRadius: 10, padding: "12px 16px" }}><div style={{ fontSize: 10, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{T.cr} · {cr} %</div><div style={{ fontSize: 24, fontWeight: 800, color: AF.black }}>{money(pub * cr / 100)}</div></div>}
      </div>
    </div>
  </Frame>);
};
const S_YearComm = ({ lang, prog }) => {
  const T = L[lang].calc; const [cur, setCur] = useState("EUR"); const { s: sym, r } = CUR[cur];
  const [intros, setIntros] = useState(prog === "referral" ? 10 : 8), [conv, setConv] = useState(prog === "referral" ? 30 : 40), [avg, setAvg] = useState(12000), [ren, setRen] = useState(80);
  const [c1, cr] = COMM[prog]; const signed = Math.round(intros * conv / 100); const y1 = signed * avg * c1 / 100; const yr = signed * avg * (ren / 100) * cr / 100; const total = cr ? y1 + yr * 2 : y1;
  const fmt = (n) => sym + fmtN(n * r);
  const outs = cr ? [[T.out[0], signed], [T.out[1], fmt(y1)], [T.out[2], fmt(yr)], [T.out[3], fmt(total)]] : [[T.outRef[0], signed], [T.outRef[1], fmt(y1)], [T.outRef[2], fmt(signed ? y1 / signed : 0)], [T.outRef[3], fmt(y1)]];
  return (<Frame><Bar /><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><H2>{T.h2}</H2><CurSwitch cur={cur} setCur={setCur} /></div><P>{T.p2}</P>
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 22 }}>
      <div style={{ background: AF.grayLight, borderRadius: 12, padding: "16px 18px" }}>
        <Slider label={T.intros} value={intros} onChange={setIntros} min={1} max={25} />
        <Slider label={T.conv} value={conv} onChange={setConv} min={10} max={100} step={5} suffix=" %" />
        <Slider label={T.avg + " (" + sym + ")"} value={Math.round(avg * r)} onChange={(v) => setAvg(v / r)} min={5000} max={60000} step={1000} />
        {cr > 0 && <Slider label={T.renew} value={ren} onChange={setRen} min={50} max={100} step={5} suffix=" %" />}
      </div>
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>{outs.map(([t, v], k) => <div key={t} style={{ background: k === 3 ? "#FDF7FB" : "#fff", border: `1px solid ${k === 3 ? AF.pink : AF.border}`, borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 9.5, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t}</div><div style={{ fontSize: 20, fontWeight: 800, color: k === 3 ? AF.pink : AF.black, marginTop: 2 }}>{v}</div></div>)}</div>
        {cr > 0 && <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 110, padding: "0 6px" }}>{[y1, yr, yr].map((v, k) => <div key={k} style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 11, fontWeight: 700 }}>{fmt(v)}</div><div style={{ height: Math.max(4, v / Math.max(y1, 1) * 70), background: k === 0 ? AF.pink : "#0096FF", borderRadius: "6px 6px 0 0" }} /><div style={{ fontSize: 10, color: AF.grayMid, marginTop: 4 }}>{["Y1", "Y2", "Y3"][k]}</div></div>)}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><AfCta small href={BOOKING_URL}>{T.cta}</AfCta></div>
      </div>
    </div>
  </Frame>);
};

/* ============ ACT 4 — ROADMAP (variants) ============ */
L.en.road2 = {
  comm: [["Day 0", "Contract signed", "Programme confirmed, portal account opened.", "Partner Manager assigned, welcome kit, incentive plan explained."], ["Day 7", "Kick-off", "You map the first ten accounts you could introduce.", "Pitch, one-pager and introduction email template handed over."], ["Day 14", "Certified", "Product & sales certification on the portal.", "Lead declaration unlocked in the portal."], ["Day 30", "First lead validated", "First warm introduction by email, lead declared in the portal.", "Lead validated within 48 h; an AE takes it and keeps you informed at each stage."], ["Day 60", "First demo", "Advisory: you join the demo. Referral: you receive the status update.", "AssessFirst runs demo, proposal and contract."], ["Day 90", "First signature", "First commission computed in the portal.", "Paid once the client has paid; review of the next ten accounts."]],
};
L.fr.road2 = {
  comm: [["Jour 0", "Contrat signé", "Programme confirmé, compte portail ouvert.", "Partner Manager assigné, kit de bienvenue, plan d'incentives expliqué."], ["Jour 7", "Kick-off", "Vous cartographiez les dix premiers comptes que vous pourriez présenter.", "Pitch, one-pager et modèle d'email de mise en relation remis."], ["Jour 14", "Certifié", "Certification produit & vente sur le portail.", "Déclaration de leads débloquée dans le portail."], ["Jour 30", "Premier lead validé", "Première mise en relation par email, lead déclaré dans le portail.", "Lead validé sous 48 h ; un AE le prend et vous informe à chaque étape."], ["Jour 60", "Première démo", "Advisory : vous participez à la démo. Referral : vous recevez le suivi.", "AssessFirst mène démo, proposition et contrat."], ["Jour 90", "Première signature", "Première commission calculée dans le portail.", "Versée une fois le client encaissé ; revue des dix comptes suivants."]],
};
const S_Roadmap = ({ lang, prog }) => {
  const T = L[lang].road; const ms = isResell(prog) ? T.ms : L[lang].road2.comm;
  return (<Frame><Bar /><H2>{T.h}</H2><P>{T.p}</P>
    <div style={{ position: "relative", margin: "26px 0 8px" }}>
      <div style={{ position: "absolute", left: "8%", right: "8%", top: 19, height: 3, background: AF.gradient, borderRadius: 2, zIndex: 0 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, position: "relative", zIndex: 1 }}>
        {ms.map(([d, t, you, af], k) => (
          <div key={t}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><span style={{ width: 34, height: 34, borderRadius: "50%", background: k === 5 ? AF.black : AF.pink, color: "#fff", fontSize: 10, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "4px solid #fff", boxShadow: `0 0 0 1px ${AF.border}`, boxSizing: "content-box" }}>{d.split(" ")[1]}</span></div>
            <div style={{ textAlign: "center", fontSize: 10, color: AF.pink, fontWeight: 700 }}>{d}</div>
            <div style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, color: AF.black, margin: "2px 0 10px", lineHeight: 1.3, minHeight: 34, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>{t}</div>
            <div style={{ background: "#FFF5FA", border: `1px solid ${AF.pink}`, borderRadius: 10, padding: "9px 10px", marginBottom: 6, minHeight: 78 }}><div style={{ fontSize: 9, color: AF.pink, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{T.you}</div><div style={{ fontSize: 10.5, color: AF.black, lineHeight: 1.45 }}>{you}</div></div>
            <div style={{ background: AF.grayLight, borderRadius: 10, padding: "9px 10px", minHeight: 78 }}><div style={{ fontSize: 9, color: AF.grayMid, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{T.af}</div><div style={{ fontSize: 10.5, color: AF.black, lineHeight: 1.45 }}>{af}</div></div>
          </div>))}
      </div>
    </div>
  </Frame>);
};
const S_Tiers = ({ lang, prog }) => {
  const T = L[lang].prog;
  return (
    <Frame><Bar /><H2>{T.tH}</H2><P>{T.tP}</P>
      <Kicker>{T.cards[prog][0]}</Kicker>
      <div style={{ border: `1px solid ${AF.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr", background: AF.grayLight, padding: "10px 16px", fontSize: 10, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{T.tCols.map((c) => <span key={c}>{c}</span>)}</div>
        {T.tiers[prog].map(([a, b, c, d], i) => (
          <div key={a} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr", padding: "14px 16px", borderTop: `1px solid ${AF.border}`, fontSize: 13, alignItems: "center", background: i === 2 ? "#FFF5FA" : "#fff" }}>
            <b style={{ color: i === 2 ? AF.pink : AF.black }}>{a}</b><span>{b}</span><b style={{ fontSize: 16, color: AF.pink }}>{c}</b><span style={{ color: AF.grayMid }}>{d}</span>
          </div>))}
      </div>
      <p style={{ fontSize: 10.5, color: "#98A2AE", margin: 0 }}>{T.tNote}</p>
    </Frame>
  );
};

const S_Products = ({ lang }) => {
  const T = L[lang].sell;
  return (
    <Frame><Bar /><H2>{T.h}</H2><P>{T.p}</P>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>{PRODUCTS.map((p) => <ProductTile key={p.id} p={p} big lang={lang} />)}</div>
      <p style={{ fontSize: 11.5, color: AF.grayMid, lineHeight: 1.55, margin: 0, maxWidth: 760 }}>{T.note}</p>
    </Frame>
  );
};
const S_Margin = ({ lang }) => {
  const T = L[lang].sell;
  return (
    <Frame><Bar /><H2>{T.h2}</H2><P>{T.p2}</P>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "stretch", marginBottom: 16 }}>
        <div style={{ border: `2px solid ${AF.pink}`, borderRadius: 12, padding: "18px 20px", background: "#FFF5FA" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: AF.pink, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>{T.tokT}</div>
          {T.tok.map((t) => <div key={t} style={{ display: "flex", gap: 8, fontSize: 12.5, color: AF.black, marginBottom: 8, lineHeight: 1.45 }}><Check size={15} />{t}</div>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: AF.grayMid }}>+</div>
        <div style={{ border: `1px solid ${AF.border}`, borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>{T.servT}</div>
          {T.serv.map((t) => <div key={t} style={{ display: "flex", gap: 8, fontSize: 12.5, color: AF.black, marginBottom: 8, lineHeight: 1.45 }}><span style={{ color: AF.pink }}>·</span>{t}</div>)}
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#98A2AE", margin: 0 }}>{T.foot}</p>
    </Frame>
  );
};

/* ============ ACT 4 — PARTNER BACK-OFFICE (product vision, English UI) ============ */
const BO_INTRO = {
  en: { h: "Your partner back-office — run your clients without waiting for us", p: "Request client accounts, manage users, follow consumption and renewals, open client workspaces. AssessFirst creates every client account; you do the rest. The demo below is interactive.", spec: "Product spec" },
  fr: { h: "Votre back-office partenaire — pilotez vos clients sans nous attendre", p: "Demandez la création de comptes clients, gérez les utilisateurs, suivez consommation et renouvellements, ouvrez les espaces clients. AssessFirst crée chaque compte client ; vous faites le reste. La démo ci-dessous est interactive.", spec: "Spécification produit" },
};
const SEED_BY_PROFILE = {
  rpo: [["Nordwind Retail", "FR", 20000, 14200, "2026-01-12", 9, "250-1000"], ["Bergmann Logistics", "DE", 15000, 11800, "2025-11-20", 7, ">1000"], ["Kestrel Contact Centres", "UK", 12500, 5100, "2026-05-02", 5, "250-1000"], ["Altura Hospitality", "ES", 7500, 6900, "2025-10-15", 4, "<250"], ["Cielo Fintech", "IT", 10000, 3200, "2026-07-01", 6, "<250"]],
  recruit: [["Maison Verdier", "FR", 5000, 3100, "2026-02-03", 3, "<250"], ["Orbis Consulting", "BE", 5000, 4300, "2025-10-20", 2, "<250"], ["Helix Biotech", "CH", 7500, 2600, "2026-06-15", 4, "250-1000"], ["Northgate Real Estate", "UK", 5000, 1400, "2026-08-01", 1, "<250"], ["Solano Energy", "ES", 10000, 1200, "2026-08-20", 3, ">1000"]],
  consult: [["Groupe Amarante", "FR", 10000, 6400, "2026-01-20", 5, ">1000"], ["Steinberg Industries", "DE", 7500, 7100, "2025-11-05", 4, "250-1000"], ["Lumen Insurance", "NL", 5000, 1900, "2026-05-12", 3, "250-1000"], ["Vantage Public Sector", "UK", 12500, 4300, "2026-04-01", 6, ">1000"], ["Aurora Pharma", "IT", 5000, 800, "2026-08-25", 2, "<250"]],
};
const addYear = (d) => { const x = new Date(d); x.setFullYear(x.getFullYear() + 1); return x.toISOString().slice(0, 10); };
const daysTo = (d) => Math.round((new Date(d) - new Date("2026-10-12")) / 86400000);
const MIX = [0.05, 0.18, 0.07, 0.28, 0.14, 0.14, 0.14];
const PCOL = ["#757575", "#0096FF", "#7C3AED", "#FF2F92", "#FFA800", "#029CAF", "#2FB86A"];
const ROLES = ["Admin", "Recruiter", "Manager"];
const SPEC = {
  Overview: { story: "As a partner admin, I see in one screen what I have ordered, what my clients have consumed, and which renewals are coming.", rules: ["Every order creates one client company with its own subscription (12/24/36/48 months)", "Tokens ordered = sum of client allocations; no partner-level pool in v1", "Renewal date = subscription start + duration"], data: ["orders (date, tokens, amount, company_id), company (start, end, tokens, consumed)"], rights: ["Reseller & Distributor: read"], out: ["Prepaid credit pool (v2)", "Alerts & notifications (v2)"] },
  Clients: { story: "As a partner admin, I list every client company with consumption %, dates and users, and I request new ones.", rules: ["Client accounts are created by AssessFirst from the partner's request; status 'Pending' until created", "Declared headcount is verified by AssessFirst before creation; the invoice reflects the verified band", "Users count opens the Users tab filtered on that client"], data: ["company_id, name, country, headcount_band, tokens, consumed, start, renewal, users_count, status"], rights: ["Both: read, request creation"], out: ["Self-service company creation", "Export"] },
  "Request client": { story: "As a partner admin, I request a client account in five fields; AssessFirst creates it and invoices me at my partner price.", rules: ["Price = public grid (verified headcount band × commitment) − tier discount", "Minimum order: 5,000 tokens (smallest pack of the grid)", "Subscription starts at the requested start date", "Option 'allocate from prepaid credits' shown as coming soon (v2)"], data: ["request (name, country, start_date, tokens, commitment, admin_email, headcount_band)"], rights: ["Both"], out: ["Prepaid credits", "Online payment"] },
  Users: { story: "As a partner admin, I manage my clients' users: add, edit email and role, see last login.", rules: ["Roles: Admin / Recruiter / Manager", "Filter by client", "Invitation email sent by AssessFirst on add"], data: ["user_id, email, role, company_id, last_login"], rights: ["Both"], out: ["SSO per client", "Bulk import"] },
  Consumption: { story: "As a partner admin, I follow consumption per client and per product to anticipate renewals and upsell.", rules: ["Token weights: CV Screening 5, SCAN 10, SCAN Text 5, SWIPE/DRIVE/BRAIN 20, VOICE 25", "Monthly aggregation, 24-month history", "Hover a bar to read the monthly value"], data: ["consumption events (company_id, product, tokens, date)"], rights: ["Both: read"], out: ["Candidate-level data (stays in client workspace)", "Export (v2)"] },
  "Client workspace": { story: "As a partner consultant, I open a client's AssessFirst account with delegated access to configure campaigns and read results.", rules: ["Delegation granted by the client admin at creation — revocable anytime", "Every action logged with partner user identity"], data: ["delegation (partner_user_id, company_id, granted_at, revoked_at)"], rights: ["Distributor: default on", "Reseller: on client consent"], out: ["Impersonation of individual client users"] },
};
const TABS = ["Overview", "Clients", "Request client", "Users", "Consumption", "Client workspace"];
const BoBtn = ({ children, onClick, primary }) => <button onClick={onClick} style={{ background: primary ? AF.pink : "#fff", color: primary ? "#fff" : AF.black, border: primary ? "none" : `1px solid ${AF.border}`, borderRadius: 7, padding: "7px 13px", fontSize: 11, fontWeight: 600, fontFamily: AF.font, cursor: "pointer", whiteSpace: "nowrap" }}>{children}</button>;
const Kpi = ({ t, v, s }) => <div style={{ background: "#fff", border: `1px solid ${AF.border}`, borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 10, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t}</div><div style={{ fontSize: 20, fontWeight: 800, color: AF.black, margin: "3px 0 1px" }}>{v}</div>{s && <div style={{ fontSize: 10, color: AF.grayMid }}>{s}</div>}</div>;
const Input = (props) => <input {...props} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${AF.border}`, borderRadius: 7, fontFamily: AF.font, fontSize: 12, color: AF.black, boxSizing: "border-box", ...props.style }} />;
const mkUsers = (seed) => seed.flatMap(([n, , , , , users], ci) => Array.from({ length: users }).map((_, i) => ({ id: `${ci}-${i}`, ci, email: `user${i + 1}@${n.split(" ")[0].toLowerCase()}.com`, role: ROLES[i === 0 ? 0 : i % 2 === 0 ? 2 : 1], last: `2026-10-${String(1 + (i * 3) % 11).padStart(2, "0")}` })));

const S_BackOffice = ({ lang, profile, prog, internal }) => {
  const T = BO_INTRO[lang];
  const [tab, setTab] = useState(0);
  const [clients, setClients] = useState(() => SEED_BY_PROFILE[profile].map(([n, c, a, u, s, users, hc]) => ({ n, c, a, u, s, users, hc, st: "Active" })));
  const [users, setUsers] = useState(() => mkUsers(SEED_BY_PROFILE[profile]));
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [ws, setWs] = useState(null);
  const [msg, setMsg] = useState("");
  const [hoverBar, setHoverBar] = useState(null);
  const [form, setForm] = useState({ n: "", c: "", e: "", hc: "<250", tk: 5000, start: "2026-11-01", months: 12 });
  const disc = DISC[prog][0];
  const ordered = clients.reduce((s, c) => s + c.a, 0), consumed = clients.reduce((s, c) => s + c.u, 0);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };
  const Spec = () => { const s = SPEC[TABS[tab]]; return internal ? (
    <div style={{ background: AF.black, color: "#fff", borderRadius: 12, padding: 16, fontSize: 11, lineHeight: 1.5, alignSelf: "start" }}>
      <div style={{ color: "#FFA800", fontWeight: 700, marginBottom: 8, fontSize: 11 }}>{T.spec} · {TABS[tab]}</div>
      {[["User story", s.story], ["Business rules", s.rules], ["Data", s.data], ["Rights", s.rights], ["Out of scope v1", s.out]].map(([k, v]) => <div key={k} style={{ marginBottom: 8 }}><div style={{ color: "#9A9A9E", fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</div>{Array.isArray(v) ? v.map((x) => <div key={x}>· {x}</div>) : <div>{v}</div>}</div>)}
    </div>) : null; };
  const grid = "1.5fr .45fr .7fr 1fr .85fr .85fr .55fr .8fr";
  const Pct = ({ c }) => { const r = c.a ? c.u / c.a : 0; const col = r >= 0.8 ? AF.pink : r >= 0.4 ? "#0096FF" : "#12B76A"; return <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 46, height: 6, background: AF.grayLight, borderRadius: 3, overflow: "hidden", display: "inline-block" }}><span style={{ display: "block", width: `${Math.min(100, r * 100)}%`, height: 6, background: col }} /></span><b style={{ color: col }}>{Math.round(r * 100)}%</b></span>; };
  const panel = { background: "#fff", borderRadius: 10, padding: 18, minHeight: 360 };
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"], vals = [4200, 5100, 6300, 5800, 7400, 8100, 7900, 9200, 8600, 6100];
  let body;
  if (ws !== null) body = (<div style={{ ...panel, border: `2px solid ${AF.pink}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontSize: 12 }}>Delegated access · <b>{clients[ws].n}</b> · every action is logged</span><BoBtn onClick={() => setWs(null)}>← Back to back-office</BoBtn></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>{[["Campaigns", 7], ["Candidates", 312], ["Job models", 5], ["Reports", 148]].map(([k, v]) => <Kpi key={k} t={k} v={v} />)}</div>
    <div style={{ background: AF.grayLight, borderRadius: 10, height: 150, display: "flex", alignItems: "center", justifyContent: "center", color: AF.grayMid, fontSize: 12, gap: 8 }}><AfLogo size={13} /> client workspace — campaigns, predictive models, results</div>
  </div>);
  else if (tab === 0) { const next = clients.filter((c) => c.st === "Active").sort((a, b) => addYear(a.s) < addYear(b.s) ? -1 : 1).slice(0, 3); body = (<div style={panel}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}><Kpi t="Tokens ordered" v={fmtN(ordered)} s={`${clients.length} client accounts`} /><Kpi t="Consumed by clients" v={fmtN(consumed)} s={`${ordered ? Math.round(consumed / ordered * 100) : 0}% of ordered`} /><Kpi t="Remaining at clients" v={fmtN(ordered - consumed)} s="across all subscriptions" /><Kpi t="Your tier" v={`${TIER_NAMES[0]} · −${disc}%`} s={L[lang].prog.cards[prog][0]} /></div>
    <div style={{ height: 12, background: AF.grayLight, borderRadius: 6, marginTop: 14, overflow: "hidden" }}><div style={{ width: `${ordered ? consumed / ordered * 100 : 0}%`, height: "100%", background: AF.black }} /></div>
    <div style={{ fontSize: 10, color: AF.grayMid, marginTop: 4 }}>■ consumed · remaining</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
      <div><div style={{ fontSize: 10.5, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Orders</div>{clients.slice(0, 5).map((c) => <div key={c.n} style={{ display: "grid", gridTemplateColumns: "1.6fr .8fr .8fr", fontSize: 11.5, padding: "6px 0", borderTop: `1px solid ${AF.border}` }}><span>{c.n}</span><span>{fmtN(c.a)} tk</span><span style={{ color: AF.grayMid }}>{c.s}</span></div>)}</div>
      <div><div style={{ fontSize: 10.5, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Next renewals</div>{next.map((c) => <div key={c.n} style={{ display: "grid", gridTemplateColumns: "1.6fr .8fr .8fr", fontSize: 11.5, padding: "6px 0", borderTop: `1px solid ${AF.border}` }}><span>{c.n}</span><span style={{ color: daysTo(addYear(c.s)) <= 60 ? AF.pink : AF.black }}>{addYear(c.s)}</span><span style={{ color: AF.grayMid }}>in {daysTo(addYear(c.s))} days</span></div>)}</div>
    </div>
    <div style={{ marginTop: 16 }}><BoBtn primary onClick={() => setTab(2)}>+ Request a client account</BoBtn></div>
  </div>); }
  else if (tab === 1) body = (<div style={{ ...panel, padding: 0, overflow: "hidden" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 6px" }}><b style={{ fontSize: 13 }}>{clients.length} client accounts</b><BoBtn primary onClick={() => setTab(2)}>+ Request a client account</BoBtn></div>
    <div style={{ display: "grid", gridTemplateColumns: grid, padding: "6px 16px", fontSize: 10, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.04em" }}>{["Client", "Country", "Tokens", "Consumed", "Start", "Renewal", "Users", "Status"].map((h) => <span key={h}>{h}</span>)}</div>
    {clients.map((c, i) => <div key={c.n + i} style={{ display: "grid", gridTemplateColumns: grid, padding: "10px 16px", borderTop: `1px solid ${AF.border}`, fontSize: 12, alignItems: "center", opacity: c.st === "Active" ? 1 : 0.7 }}><b>{c.n}</b><span>{c.c}</span><span>{fmtN(c.a)}</span><Pct c={c} /><span>{c.s}</span><span style={{ color: daysTo(addYear(c.s)) <= 60 ? AF.pink : AF.black }}>{addYear(c.s)}</span><span onClick={() => { setFilter(String(i)); setTab(3); }} style={{ color: AF.pink, fontWeight: 700, cursor: "pointer" }}>{c.users} →</span><span style={{ fontSize: 10, fontWeight: 600, color: c.st === "Active" ? "#12B76A" : "#B54708", background: c.st === "Active" ? "#E7F8F0" : "#FFF6E6", borderRadius: 8, padding: "3px 8px", justifySelf: "start" }}>{c.st}</span></div>)}
  </div>);
  else if (tab === 2) { const pub = publicPrice(form.tk, form.months, form.hc), cost = pub * (1 - disc / 100); body = (<div style={panel}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}><b style={{ fontSize: 15 }}>Request a client account</b><Seg value="order" onChange={() => {}} options={[["order", "Order for this client"], ["pool", "Allocate from prepaid credits · coming soon"]]} /></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
      <label style={{ fontSize: 11, color: AF.grayMid }}>Company name<Input value={form.n} onChange={(e) => setForm({ ...form, n: e.target.value })} placeholder="Acme Group" /></label>
      <label style={{ fontSize: 11, color: AF.grayMid }}>Country<Input value={form.c} onChange={(e) => setForm({ ...form, c: e.target.value })} placeholder="FR" /></label>
      <label style={{ fontSize: 11, color: AF.grayMid }}>Client admin email<Input value={form.e} onChange={(e) => setForm({ ...form, e: e.target.value })} placeholder="hr@acme.com" /></label>
      <label style={{ fontSize: 11, color: AF.grayMid }}>Start date<Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></label>
      <label style={{ fontSize: 11, color: AF.grayMid }}>Commitment<div style={{ marginTop: 4 }}><Seg value={form.months} onChange={(v) => setForm({ ...form, months: v })} options={[[12, "12 m"], [24, "24 m"], [36, "36 m"], [48, "48 m"]]} /></div></label>
      <label style={{ fontSize: 11, color: AF.grayMid }}>Client headcount <span style={{ color: "#98A2AE" }}>· verified by AssessFirst before creation</span><div style={{ marginTop: 4 }}><Seg value={form.hc} onChange={(v) => setForm({ ...form, hc: v })} options={[["<250", "< 250"], ["250-1000", "250–1,000"], [">1000", "> 1,000"]]} /></div></label>
    </div>
    <div style={{ marginTop: 12 }}><Slider label="Tokens for this client" value={form.tk} onChange={(v) => setForm({ ...form, tk: v })} min={5000} max={100000} step={2500} suffix=" tk" /></div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: AF.grayLight, borderRadius: 8, padding: "10px 14px", gap: 12 }}>
      <span style={{ fontSize: 11.5, color: AF.grayMid, lineHeight: 1.5 }}>Public price €{fmtN(pub)} − {disc}% = <b style={{ color: AF.black }}>€{fmtN(cost)}</b> invoiced to you by AssessFirst. The account is created by AssessFirst within 2 business days; the subscription runs {form.months} months from {form.start}.</span>
      <BoBtn primary onClick={() => { if (!form.n) { flash("Give the company a name first."); return; } setClients([...clients, { n: form.n, c: form.c || "—", a: form.tk, u: 0, s: form.start, users: 0, hc: form.hc, st: "Pending" }]); flash(`Request sent — ${form.n} will be created by AssessFirst.`); setForm({ ...form, n: "", c: "", e: "" }); setTab(1); }}>Send request</BoBtn>
    </div>
  </div>); }
  else if (tab === 3) { const list = users.filter((u) => filter === "all" || String(u.ci) === filter); body = (<div style={panel}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10 }}>
      <b style={{ fontSize: 15 }}>Users</b>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ fontFamily: AF.font, fontSize: 12, padding: "6px 10px", border: `1px solid ${AF.border}`, borderRadius: 7, marginLeft: "auto" }}><option value="all">All clients</option>{clients.map((c, i) => <option key={c.n + i} value={String(i)}>{c.n}</option>)}</select>
      <BoBtn primary onClick={() => { const ci = filter === "all" ? 0 : Number(filter); setUsers([...users, { id: `${ci}-${Date.now()}`, ci, email: `new@${clients[ci].n.split(" ")[0].toLowerCase()}.com`, role: "Recruiter", last: "—" }]); const cs = [...clients]; cs[ci] = { ...cs[ci], users: cs[ci].users + 1 }; setClients(cs); flash("Invitation sent by AssessFirst."); }}>+ Add user</BoBtn>
    </div>
    <div style={{ border: `1px solid ${AF.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr .6fr", padding: "6px 14px", background: AF.grayLight, fontSize: 10, color: AF.grayMid, textTransform: "uppercase" }}><span>Email</span><span>Client</span><span>Role</span><span>Last login</span><span /></div>
      {list.map((u) => <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr .6fr", padding: "8px 14px", borderTop: `1px solid ${AF.border}`, fontSize: 12, alignItems: "center", gap: 8 }}>
        {editing === u.id ? <Input value={u.email} onChange={(e) => setUsers(users.map((x) => x.id === u.id ? { ...x, email: e.target.value } : x))} /> : <span>{u.email}</span>}
        <span style={{ color: AF.grayMid }}>{clients[u.ci].n}</span>
        {editing === u.id ? <select value={u.role} onChange={(e) => setUsers(users.map((x) => x.id === u.id ? { ...x, role: e.target.value } : x))} style={{ fontFamily: AF.font, fontSize: 12, padding: "5px 8px", border: `1px solid ${AF.border}`, borderRadius: 7 }}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select> : <span style={{ color: u.role === "Admin" ? AF.pink : AF.black, fontWeight: 600 }}>{u.role}</span>}
        <span style={{ color: AF.grayMid }}>{u.last}</span>
        <span onClick={() => setEditing(editing === u.id ? null : u.id)} style={{ fontSize: 10.5, color: AF.pink, cursor: "pointer", fontWeight: 700 }}>{editing === u.id ? "Save" : "Edit"}</span>
      </div>)}
    </div>
  </div>); }
  else if (tab === 4) body = (<div style={panel}>
    <b style={{ fontSize: 15 }}>Consumption by client and product</b>
    <div style={{ display: "flex", gap: 12, fontSize: 10.5, color: AF.grayMid, margin: "10px 0 8px" }}>{PRODUCTS.map((p, i) => <span key={p.id}><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: PCOL[i], marginRight: 4 }} />{p.id}</span>)}</div>
    {clients.filter((c) => c.u).map((c) => <div key={c.n} style={{ display: "grid", gridTemplateColumns: "1.3fr 3fr .8fr", gap: 10, alignItems: "center", marginBottom: 7, fontSize: 12 }}><span>{c.n}</span><div style={{ display: "flex", height: 16, borderRadius: 4, overflow: "hidden", background: AF.grayLight }}>{MIX.map((m, i) => <div key={i} style={{ width: `${c.u / 20000 * m * 100}%`, background: PCOL[i] }} />)}</div><span style={{ color: AF.grayMid, textAlign: "right" }}>{fmtN(c.u)} tk</span></div>)}
    <div style={{ fontSize: 10.5, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", margin: "16px 0 6px" }}>Monthly consumption (tokens) — hover a bar</div>
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 96 }}>{vals.map((v, i) => <div key={i} onMouseEnter={() => setHoverBar(i)} onMouseLeave={() => setHoverBar(null)} style={{ flex: 1, textAlign: "center", cursor: "default" }}><div style={{ fontSize: 10, fontWeight: 700, color: AF.black, height: 14 }}>{hoverBar === i || (hoverBar === null && i === vals.length - 1) ? fmtN(v) : ""}</div><div style={{ height: v / 130, background: hoverBar === i || i === vals.length - 1 ? AF.pink : AF.black, borderRadius: "4px 4px 0 0", opacity: hoverBar === null || hoverBar === i ? 1 : 0.55 }} /><div style={{ fontSize: 9, color: AF.grayMid, marginTop: 3 }}>{months[i]}</div></div>)}</div>
  </div>);
  else body = (<div style={panel}><b style={{ fontSize: 15 }}>Open a client workspace</b><p style={{ fontSize: 11.5, color: AF.grayMid, margin: "6px 0 14px" }}>Delegated access to your client's AssessFirst account — no password to share, every action logged, revocable by the client at any time.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>{clients.map((c, i) => c.st === "Active" && <div key={c.n + i} style={{ background: AF.grayLight, borderRadius: 10, padding: 12 }}><b style={{ fontSize: 12.5 }}>{c.n}</b><div style={{ fontSize: 10.5, color: AF.grayMid, margin: "3px 0 10px" }}>{c.users} users · {fmtN(c.a - c.u)} tk left</div><BoBtn primary onClick={() => setWs(i)}>Open workspace</BoBtn></div>)}</div>
  </div>);
  return (
    <Frame gray>
      <H2>{T.h}</H2><P>{T.p}</P>
      <div style={{ background: "#fff", border: `1px solid ${AF.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 16px", height: 48, borderBottom: `1px solid ${AF.border}` }}>
          <AfLogo size={13} /><span style={{ fontSize: 11, color: AF.grayMid, marginLeft: -8 }}>Partner back-office</span>
          <div style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }}>{TABS.map((x, i) => <span key={x} onClick={() => { setTab(i); setWs(null); }} style={{ fontSize: 11.5, padding: "14px 9px", cursor: "pointer", whiteSpace: "nowrap", color: tab === i ? AF.black : AF.grayMid, fontWeight: tab === i ? 700 : 400, borderBottom: tab === i ? `2px solid ${AF.pink}` : "2px solid transparent" }}>{x}</span>)}</div>
          <span style={{ fontSize: 11, fontWeight: 600, border: `1px solid ${AF.border}`, borderRadius: 20, padding: "4px 10px", display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 9, height: 9, borderRadius: 5, background: AF.gradient, display: "inline-block" }} />{fmtN(ordered - consumed)} tk remaining</span>
          <span style={{ fontSize: 10.5, color: AF.grayMid }}>{L[lang].prog.cards[prog][0]}</span>
        </div>
        <div style={{ padding: 14, background: AF.grayLight, display: "grid", gridTemplateColumns: internal ? "1fr 290px" : "1fr", gap: 12 }}>{body}<Spec /></div>
        {msg && <div style={{ margin: "0 14px 14px", background: AF.black, color: "#fff", borderRadius: 8, padding: "9px 14px", fontSize: 12 }}>{msg}</div>}
      </div>
    </Frame>
  );
};

/* ============ I18N — buy / simulator / roadmap ============ */
L.en.buy = {
  h: "One grid, one way to order", p: "You order for a named client; AssessFirst creates the client account and invoices you at the public price minus your tier discount. Prepaid credits you allocate yourself are on the roadmap.",
  available: "Available", soon: "In development",
  modes: [["Per-client order", ["You order the tokens one client needs, from 5,000 tokens", "Price = public grid (client size × commitment, 12 to 48 months) − your discount", "Client size is verified by AssessFirst before the account is created — no surprise on the invoice", "Each order = one client account with its own subscription"]],
          ["Prepaid credits", ["You buy a volume of credits for your portfolio and allocate them to clients from your back-office", "Credits valid 12 months to allocate; each allocation opens a 12-month client subscription", "Designed for partners who operate AssessFirst in their own missions: RPO, assessment centres", "Available once the back-office supports partner-level balances"]]],
  rules: [["Subscription, not tokens", "Your client buys a service allowing up to N tokens for the chosen commitment; AssessFirst creates the account and the subscription."], ["Your invoice, your price", "AssessFirst invoices you at your partner price; you invoice your client at yours and add your services."], ["Renewals are yours", "You see every renewal date in your back-office and renew by placing a new order."]],
  gH: "Public price grid", gP: "The grid our direct sales team uses, from 5,000 to 500,000 tokens; above that, custom terms. Pick the client size and commitment: your partner price applies your tier discount, and the difference with the public price is your margin if you resell at list price.",
  tokens: "Tokens", commit: "Commitment", size: "Client size", employees: "employees", tier: "Your tier", pub: "Public price", part: "Your partner price", perTk: "per token", mLbl: "margin", yourMargin: "Your margin if resold at public price", custom: "Custom", keyRows: ["Tokens", "Public price", "/ token", "Your partner price", "/ token", "Your margin at public price"], months: "months",
  convT: "What does that buy?", convP: "Tick the tools your clients would use on each person — the grid shows how many people you can assess with this volume.", people: "people assessed", perPerson: "tokens per person",
};
L.fr.buy = {
  h: "Une grille, une façon de commander", p: "Vous commandez pour un client nommé ; AssessFirst crée le compte client et vous facture au prix public moins la remise de votre tier. Les crédits prépayés que vous allouez vous-même sont sur la feuille de route.",
  available: "Disponible", soon: "En développement",
  modes: [["Commande par client", ["Vous commandez les tokens dont un client a besoin, à partir de 5 000 tokens", "Prix = grille publique (taille du client × engagement, 12 à 48 mois) − votre remise", "La taille du client est vérifiée par AssessFirst avant la création du compte — aucune surprise sur la facture", "Chaque commande = un compte client avec son propre abonnement"]],
          ["Crédits prépayés", ["Vous achetez un volume de crédits pour votre portefeuille et les allouez à vos clients depuis votre back-office", "Crédits valables 12 mois pour être alloués ; chaque allocation ouvre un abonnement client de 12 mois", "Conçu pour les partenaires qui opèrent AssessFirst dans leurs propres missions : RPO, assessment centers", "Disponible dès que le back-office gère les soldes au niveau partenaire"]]],
  rules: [["Un abonnement, pas des tokens", "Votre client achète un service lui donnant droit à N tokens sur l'engagement choisi ; AssessFirst crée le compte et l'abonnement."], ["Votre facture, votre prix", "AssessFirst vous facture au prix partenaire ; vous facturez votre client au vôtre et ajoutez vos services."], ["Les renouvellements sont à vous", "Vous voyez chaque date de renouvellement dans votre back-office et renouvelez en passant une nouvelle commande."]],
  gH: "Grille tarifaire publique", gP: "La grille utilisée par notre équipe de vente directe, de 5 000 à 500 000 tokens ; au-delà, conditions sur mesure. Choisissez la taille du client et l'engagement : votre prix partenaire applique la remise de votre tier, et l'écart avec le prix public est votre marge si vous revendez au tarif public.",
  tokens: "Tokens", commit: "Engagement", size: "Taille du client", employees: "salariés", tier: "Votre tier", pub: "Prix public", part: "Votre prix partenaire", perTk: "par token", mLbl: "de marge", yourMargin: "Votre marge si revendu au prix public", custom: "Sur mesure", keyRows: ["Tokens", "Prix public", "/ token", "Votre prix partenaire", "/ token", "Votre marge au prix public"], months: "mois",
  convT: "Ça représente quoi ?", convP: "Cochez les outils que vos clients utiliseraient pour chaque personne : vous voyez combien de personnes ce volume permet d'évaluer.", people: "personnes évaluées", perPerson: "tokens par personne",
};
L.en.sim = {
  h: "Your year with AssessFirst", p: "The price grid shows one order. This screen adds them up: how many clients a year, how many campaigns and candidates each, which tools — and what it leaves you at each tier. Every figure is an assumption you can change.",
  s1: "1 · Your portfolio", clients: "Clients equipped per year", camps: "AssessFirst campaigns per client per year", cands: "Candidates per campaign",
  s2: "2 · Tools used", s2n: "Tick the tools and the share of candidates assessed with each. Nothing is pre-selected.",
  s3: "3 · Your orders", commit: "Client commitment", size: "Typical client size",
  vol: "Your estimated volume", volu: "tokens / year", people: "candidates per client", perPerson: "tk each", perClient: "tokens ordered per client", minPack: "minimum pack", none: "Tick at least one tool to estimate your volume.",
  tCols: ["Tier", "Discount", "Partner cost / year", "Gross profit / year", "Margin"], best: "Selected",
  resale: "Resale price / token", rmodes: [["public", "Public price"], ["custom", "Custom"]],
  resaleHint: "“Public price” = what your client would pay AssessFirst for the same volume, size and commitment; your margin is then your tier discount. “Custom” = your own price.",
  how: (custom, rs, pc, disc) => custom ? `Your own resale price: ${rs} per token versus ${pc} bought.` : `You buy at ${pc} per token and resell at the public price, ${rs}: your margin is your tier discount, ${disc}%.`,
  kpis: ["Potential token revenue", "Partner cost", "Gross profit on tokens", "Gross margin"],
  services: "Plus your services: setup, training, debriefs, assessment centres, coaching — billed on top of this margin, at your rates.",
  cta: "Discuss this business case",
};
L.fr.sim = {
  h: "Votre année avec AssessFirst", p: "La grille tarifaire montre une commande. Cet écran les additionne : combien de clients par an, combien de campagnes et de candidats chacun, quels outils — et ce qu'il vous reste à chaque tier. Chaque chiffre est une hypothèse modifiable.",
  s1: "1 · Votre portefeuille", clients: "Clients équipés par an", camps: "Campagnes AssessFirst par client et par an", cands: "Candidats par campagne",
  s2: "2 · Outils utilisés", s2n: "Cochez les outils et la part des candidats évalués avec chacun. Rien n'est présélectionné.",
  s3: "3 · Vos commandes", commit: "Engagement du client", size: "Taille de client type",
  vol: "Votre volume estimé", volu: "tokens / an", people: "candidats par client", perPerson: "tk chacun", perClient: "tokens commandés par client", minPack: "pack minimum", none: "Cochez au moins un outil pour estimer votre volume.",
  tCols: ["Tier", "Remise", "Coût partenaire / an", "Marge brute / an", "Marge"], best: "Sélectionné",
  resale: "Prix de revente / token", rmodes: [["public", "Prix public"], ["custom", "Personnalisé"]],
  resaleHint: "« Prix public » = ce que votre client paierait à AssessFirst pour le même volume, la même taille et le même engagement ; votre marge est alors la remise de votre tier. « Personnalisé » = votre propre prix.",
  how: (custom, rs, pc, disc) => custom ? `Votre propre prix de revente : ${rs} par token contre ${pc} à l'achat.` : `Vous achetez à ${pc} par token et revendez au prix public, ${rs} : votre marge est la remise de votre tier, ${disc} %.`,
  kpis: ["Revenu tokens potentiel", "Coût partenaire", "Marge brute tokens", "Taux de marge"],
  services: "Plus vos services : paramétrage, formation, restitutions, assessment centers, coaching — facturés en plus de cette marge, à vos tarifs.",
  cta: "Discuter de ce business case",
};
L.en.road = {
  h: "From contract to first client in 90 days", p: "A shared plan. We commit to the support, you commit to the pace. Your back-office is open on day one.",
  you: "You", af: "AssessFirst",
  ms: [["Day 0", "Contract signed", "Partnership agreement, programme and tier confirmed.", "Back-office access, Partner Manager assigned, welcome kit."], ["Day 7", "Kick-off", "Your team meets your Partner Manager; first accounts mapped.", "Back-office opened; sandbox and welcome kit delivered."], ["Day 14", "Certified", "Product & sales certification completed by your consultants on the partner portal.", "Badge issued; deal registration, sales assets and co-sell unlocked in the portal."], ["Day 30", "First client created", "First order placed; first client account requested and created.", "Onboarding of the client (Reseller) or coaching of your team (Distributor)."], ["Day 60", "First campaign live", "First assessments running at your client; consumption visible.", "Escalation path active; first monthly business review."], ["Day 90", "Business review", "Pipeline for the next quarter, renewals planned, second client in motion.", "Tier trajectory, co-marketing plan, MDF eligibility."]],
  cH: "Interested in exploring a partnership?", cP: "A 30-minute conversation with our Partnerships team is enough to see whether the model fits your business — and which programme is right for you.",
  cta: "Book a 30-minute call", mail: "or write to", restart: "↻ Restart the journey",
};
L.fr.road = {
  h: "Du contrat au premier client en 90 jours", p: "Un plan partagé. Nous nous engageons sur le support, vous sur le rythme. Votre back-office est ouvert dès le premier jour.",
  you: "Vous", af: "AssessFirst",
  ms: [["Jour 0", "Contrat signé", "Contrat de partenariat, programme et tier confirmés.", "Accès back-office, Partner Manager assigné, kit de bienvenue."], ["Jour 7", "Kick-off", "Votre équipe rencontre votre Partner Manager ; premiers comptes cartographiés.", "Back-office ouvert ; sandbox et kit de bienvenue livrés."], ["Jour 14", "Certifié", "Certification produit & vente complétée par vos consultants sur le portail partenaire.", "Badge remis ; enregistrement des deals, supports de vente et co-vente débloqués dans le portail."], ["Jour 30", "Premier client créé", "Première commande passée ; premier compte client demandé et créé.", "Onboarding du client (Revendeur) ou coaching de votre équipe (Distributeur)."], ["Jour 60", "1re campagne live", "Premières évaluations chez votre client ; consommation visible.", "Escalade active ; première revue mensuelle."], ["Jour 90", "Revue business", "Pipeline du trimestre suivant, renouvellements planifiés, deuxième client en cours.", "Trajectoire de tier, plan de co-marketing, éligibilité MDF."]],
  cH: "Envie d'explorer un partenariat ?", cP: "Une conversation de 30 minutes avec notre équipe Partenariats suffit pour voir si le modèle correspond à votre activité — et quel programme vous convient.",
  cta: "Réserver un call de 30 minutes", mail: "ou écrivez à", restart: "↻ Recommencer le parcours",
};

/* ============ ACT 2b — PARTNER PORTAL & RULES ============ */
L.en.portal = {
  h: "Your partner portal — and the rules of the game", p: "Everything you need to sell is in one place from day one. Below: what we commit to, and what we ask of you. Click a topic.",
  items: [["Action plan", "Your onboarding checklist and quarterly objectives, shared with your Partner Manager"], ["Training", "Product & sales certification, badge, refreshed at every release"], ["Resources", "Decks, battle cards, objection handling, product and training videos"], ["Leads", "Leads AssessFirst passes to you — and the ones you declare"], ["Deals", "Follow every opportunity, from declaration to signature"], ["Customers & metrics", "Your accounts, your pipeline, your commissions or your tier"]],
  mock: { nav: ["Welcome", "Action Plan", "Training", "Resources", "Leads", "Deals", "Customers", "Metrics"], tier: "Partner tier", hello: "Welcome back", kpi: [["Open deals", "7"], ["Protected", "12 m"], ["Certified", "✓"]], deal: "Declare a lead" },
  comm: [["Lead protection", [["You declare, we validate, it's protected", "You declare the lead in the portal. AssessFirst validates it — the account must not already be in our pipeline. Once validated, it is yours for 12 months: no other partner can claim it."], ["An AssessFirst salesperson runs the sale", "Referral: you are informed at each stage. Advisory: you join the demos and weigh on the decision — the commercial process stays with AssessFirst."], ["Paid on cash", "Your commission is computed on the revenue invoiced to the client and paid once the client has paid, on your invoice."]]],
    ["Data & compliance", [["The client's data stays with the client", "Candidate and employee data live in the client's AssessFirst account, hosted in the EU. Partners never access it."], ["Built for the EU AI Act", "Auditable models, bias-tested, documented methodology — the compliance file the client's legal team will ask for is ready."], ["Our science, untouched", "Assessments, reports and scores are produced by AssessFirst and never edited — that is what makes them defensible in front of your client."]]],
    ["Working with us", [["One Partner Manager", "A named contact for pitch, questions and escalations, plus a review of your pipeline every quarter."], ["Incentives", "Rewards planned over the year, on top of commission — your Partner Manager shares the triggers."], ["No annual objective", "Referral and Advisory have no minimum; you introduce when it makes sense for your client."]]]],
  resell: [["Deal protection", [["Register, you're protected", "A registered opportunity is yours for 12 months: AssessFirst does not sell there, direct or through another partner."], ["Conflicts are arbitrated, not ignored", "If two parties claim an account, your Partner Manager decides on the registration date — in writing, within 5 days."], ["Your clients stay yours", "Accounts you have signed are never approached by our sales team. Renewals and upsell go through you."]]],
    ["Data & compliance", [["Your client owns its data", "Candidate and employee data sit in the client's own account, hosted in the EU. You access it only through delegated access the client can revoke."], ["Built for the EU AI Act", "Auditable models, bias-tested, documented methodology — the compliance file your clients' legal teams will ask for is ready."], ["Our science, untouched", "You sign the service you deliver; assessments, reports and scores are produced by AssessFirst and never edited."]]],
    ["Co-selling & marketing", [["Co-sell on demand", "On a strategic deal, an AssessFirst expert joins your demo or pitch — you lead, we support, the deal stays yours."], ["Co-branded content", "Case studies, webinars and local campaigns built together; market development funds co-finance them from Premier tier."], ["Annual objective", "One new client a year keeps your partnership active. Your tier is reviewed once a year on managed ARR."]]],
    ["What if…", [["…I don't reach my tier?", "Nothing is taken back mid-year: the tier is reviewed once a year on managed ARR. You keep your discount and your clients."], ["…a client leaves?", "The subscription ends at term; your remaining clients and your tier are unaffected. No penalty, no claw-back."], ["…I want to grow?", "Reseller to Distributor is a conversation with your Partner Manager at the annual review."]]]],
};
L.fr.portal = {
  h: "Votre portail partenaire — et les règles du jeu", p: "Tout ce dont vous avez besoin pour vendre est réuni au même endroit dès le premier jour. Ci-dessous : ce à quoi nous nous engageons, et ce que nous attendons de vous. Cliquez sur un thème.",
  items: [["Plan d'action", "Votre checklist de démarrage et vos objectifs trimestriels, partagés avec votre Partner Manager"], ["Formation", "Certification produit & vente, badge, mise à jour à chaque version"], ["Ressources", "Decks, battle cards, réponses aux objections, vidéos produit et formation"], ["Leads", "Les leads qu'AssessFirst vous transmet — et ceux que vous déclarez"], ["Deals", "Suivez chaque opportunité, de la déclaration à la signature"], ["Clients & indicateurs", "Vos comptes, votre pipeline, vos commissions ou votre tier"]],
  mock: { nav: ["Accueil", "Plan d'action", "Formation", "Ressources", "Leads", "Deals", "Clients", "Indicateurs"], tier: "Tier partenaire", hello: "Bon retour", kpi: [["Deals ouverts", "7"], ["Protégés", "12 m"], ["Certifié", "✓"]], deal: "Déclarer un lead" },
  comm: [["Protection des leads", [["Vous déclarez, nous validons, c'est protégé", "Vous déclarez le lead dans le portail. AssessFirst le valide — le compte ne doit pas déjà être dans notre pipeline. Une fois validé, il est à vous pendant 12 mois : aucun autre partenaire ne peut le revendiquer."], ["Un commercial AssessFirst mène la vente", "Referral : vous êtes informé à chaque étape. Advisory : vous participez aux démos et pesez sur la décision — le processus commercial reste chez AssessFirst."], ["Payé à l'encaissement", "Votre commission est calculée sur le chiffre d'affaires facturé au client et versée une fois le client encaissé, à réception de votre facture."]]],
    ["Données & conformité", [["Les données du client restent chez le client", "Les données candidats et collaborateurs vivent dans le compte AssessFirst du client, hébergées dans l'UE. Les partenaires n'y accèdent jamais."], ["Conçu pour l'EU AI Act", "Modèles auditables, testés contre les biais, méthodologie documentée — le dossier de conformité que demanderont les juristes du client est prêt."], ["Notre science, intacte", "Évaluations, rapports et scores sont produits par AssessFirst et jamais modifiés — c'est ce qui les rend défendables face à votre client."]]],
    ["Travailler avec nous", [["Un Partner Manager", "Un interlocuteur nommé pour le pitch, les questions et les escalades, plus une revue de votre pipeline chaque trimestre."], ["Incentives", "Des récompenses prévues dans l'année, en plus de la commission — votre Partner Manager en partage les déclencheurs."], ["Aucun objectif annuel", "Referral et Advisory n'ont pas de minimum ; vous présentez quand c'est pertinent pour votre client."]]]],
  resell: [["Protection des deals", [["Enregistré, donc protégé", "Une opportunité enregistrée vous appartient 12 mois : AssessFirst n'y vend pas, ni en direct, ni via un autre partenaire."], ["Les conflits sont arbitrés, pas ignorés", "Si deux parties revendiquent un compte, votre Partner Manager tranche sur la date d'enregistrement — par écrit, sous 5 jours."], ["Vos clients restent les vôtres", "Les comptes que vous avez signés ne sont jamais approchés par notre équipe commerciale. Renouvellements et ventes additionnelles passent par vous."]]],
    ["Données & conformité", [["Votre client est propriétaire de ses données", "Les données candidats et collaborateurs restent dans le compte du client, hébergées dans l'UE. Vous y accédez par un accès délégué que le client peut révoquer."], ["Conçu pour l'EU AI Act", "Modèles auditables, testés contre les biais, méthodologie documentée — le dossier de conformité que demanderont les juristes de vos clients est prêt."], ["Notre science, intacte", "Vous signez la prestation que vous délivrez ; les évaluations, rapports et scores sont produits par AssessFirst et jamais modifiés."]]],
    ["Co-vente & marketing", [["Co-vente à la demande", "Sur un deal stratégique, un expert AssessFirst rejoint votre démo ou votre soutenance — vous menez, nous appuyons, le deal reste le vôtre."], ["Contenus co-brandés", "Cas clients, webinaires et campagnes locales construits ensemble ; les fonds de développement marché les cofinancent dès le tier Premier."], ["Objectif annuel", "Un nouveau client par an maintient votre partenariat actif. Votre tier est revu une fois par an sur l'ARR géré."]]],
    ["Et si…", [["…je n'atteins pas mon tier ?", "Rien n'est repris en cours d'année : le tier est revu une fois par an sur l'ARR géré. Vous gardez votre remise et vos clients."], ["…un client part ?", "L'abonnement s'arrête à son terme ; vos autres clients et votre tier ne bougent pas. Ni pénalité, ni reprise."], ["…je veux grandir ?", "Passer de Revendeur à Distributeur se décide avec votre Partner Manager à la revue annuelle."]]]],
};
const S_Portal = ({ lang, prog }) => {
  const T = L[lang].portal, M = T.mock; const topics = isResell(prog) ? T.resell : T.comm;
  const [topic, setTopic] = useState(0);
  const icons = ["⭐", "🎓", "📚", "📋", "📈", "✅"];
  return (<Frame><Bar /><H2>{T.h}</H2><P>{T.p}</P>
    <div style={{ border: `1px solid ${AF.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 32px rgba(20,30,40,0.10)", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 14px", height: 46, borderBottom: `1px solid ${AF.border}` }}>
        <AfMark size={22} />
        {M.nav.map((n, i) => <span key={n} style={{ fontSize: 11, padding: "6px 10px", borderRadius: 7, color: i === 0 ? "#fff" : AF.black, background: i === 0 ? "#3B7BFF" : "transparent", marginLeft: i === 0 ? 8 : 0 }}>{n}</span>)}
        <span style={{ marginLeft: "auto", fontSize: 9.5, color: AF.grayMid, textAlign: "right", lineHeight: 1.2 }}>{M.tier}<br /><b style={{ fontSize: 12, color: AF.black }}>{pgName(lang, prog)}</b></span>
        <span style={{ width: 24, height: 24, borderRadius: 12, background: AF.gradient, marginLeft: 10 }} />
      </div>
      <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 2.2fr", gap: 14, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><b style={{ fontSize: 13 }}>{M.hello} 👋</b></div>
          {M.kpi.map(([k, v]) => <div key={k} style={{ border: `1px solid ${AF.border}`, borderRadius: 8, padding: "8px 10px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 10.5, color: AF.grayMid }}>{k}</span><b style={{ fontSize: 16, color: v === "✓" ? "#12B76A" : AF.black }}>{v}</b></div>)}
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, color: "#fff", background: AF.pink, borderRadius: 7, padding: "6px 12px", textTransform: "uppercase", marginTop: 4 }}>{M.deal}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{T.items.map(([t, d], i) => <div key={t} style={{ background: AF.grayLight, borderRadius: 8, padding: "10px 11px", minHeight: 86 }}><div style={{ fontSize: 11.5, fontWeight: 700, color: AF.black }}><span style={{ marginRight: 6 }}>{icons[i]}</span>{t}</div><div style={{ fontSize: 9.5, color: AF.grayMid, lineHeight: 1.4, marginTop: 4 }}>{d}</div></div>)}</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>{topics.map(([n], i) => <Chip key={n} on={topic === i} onClick={() => setTopic(i)}>{n}</Chip>)}</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
      {topics[Math.min(topic, topics.length - 1)][1].map(([a, b], i) => <div key={a} style={{ border: `1px solid ${AF.border}`, borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 10, alignItems: "baseline" }}><span style={{ width: 22, height: 22, borderRadius: 11, background: AF.pink, color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span><div><div style={{ fontSize: 13, fontWeight: 700, color: AF.black, marginBottom: 4 }}>{a}</div><div style={{ fontSize: 11.5, color: AF.grayMid, lineHeight: 1.5 }}>{b}</div></div></div></div>)}
    </div>
  </Frame>);
};

/* ============ ACT 5 — HOW YOU ORDER ============ */
const S_Modes = ({ lang }) => {
  const T = L[lang].buy;
  return (<Frame><Bar /><H2>{T.h}</H2><P>{T.p}</P>
    <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16 }}>
      <div style={{ border: `2px solid ${AF.pink}`, borderRadius: 12, padding: "18px 20px", background: "#FFF5FA" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div style={{ fontSize: 18, fontWeight: 700, color: AF.black }}>{T.modes[0][0]}</div><span style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", background: AF.pink, borderRadius: 8, padding: "3px 8px", textTransform: "uppercase" }}>{T.available}</span></div>
        {T.modes[0][1].map((p) => <div key={p} style={{ display: "flex", gap: 8, fontSize: 12.5, color: AF.black, lineHeight: 1.5, padding: "7px 0", borderTop: `1px solid ${AF.border}` }}><Check size={15} /><span>{p}</span></div>)}
      </div>
      <div style={{ border: `1px dashed ${AF.border}`, borderRadius: 12, padding: "18px 20px", opacity: 0.85 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><div style={{ fontSize: 18, fontWeight: 700, color: AF.grayMid }}>{T.modes[1][0]}</div><span style={{ fontSize: 9.5, fontWeight: 800, color: AF.grayMid, background: AF.grayLight, borderRadius: 8, padding: "3px 8px", textTransform: "uppercase" }}>{T.soon}</span></div>
        {T.modes[1][1].map((p) => <div key={p} style={{ display: "flex", gap: 8, fontSize: 12.5, color: AF.grayMid, lineHeight: 1.5, padding: "7px 0", borderTop: `1px solid ${AF.border}` }}><span style={{ color: AF.pink }}>·</span><span>{p}</span></div>)}
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 }}>{T.rules.map(([a, b]) => <div key={a} style={{ background: AF.grayLight, borderRadius: 12, padding: "14px 16px" }}><div style={{ fontSize: 13.5, fontWeight: 700, color: AF.black, marginBottom: 6 }}>{a}</div><div style={{ fontSize: 11.5, color: AF.grayMid, lineHeight: 1.5 }}>{b}</div></div>)}</div>
  </Frame>);
};
const S_Grid = ({ lang, prog }) => {
  const T = L[lang].buy;
  const [cur, setCur] = useState("EUR"); const { s: sym, r } = CUR[cur];
  const [i, setI] = useState(2), [m, setM] = useState(12), [tier, setTier] = useState(0), [sz, setSz] = useState("<250");
  const [use, setUse] = useState({ CVS: false, SCAN: true, SCANT: false, SWIPE: true, DRIVE: true, BRAIN: false, VOICE: false });
  const tk = PRICE[i][0], disc = DISC[prog][tier], pub = publicPrice(tk, m, sz), part = pub * (1 - disc / 100);
  const money = (n) => sym + fmtN(n * r);
  const perPerson = PRODUCTS.reduce((a, p) => a + (use[p.id] ? p.cost : 0), 0);
  const key = [5000, 10000, 25000, 50000, 100000, 250000, 500000];
  return (<Frame><Bar />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><H2>{T.gH}</H2><CurSwitch cur={cur} setCur={setCur} /></div><P>{T.gP}</P>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        <div style={{ background: AF.grayLight, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}><span style={{ color: AF.grayMid }}>{T.tokens}</span><b style={{ color: AF.black }}>{fmtN(tk)} tk</b></div>
          <input type="range" min={0} max={PRICE.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} style={{ width: "100%", accentColor: AF.pink, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <span><span style={{ fontSize: 11, color: AF.grayMid, marginRight: 8 }}>{T.commit}</span><Seg value={m} onChange={setM} options={[[12, "12 m"], [24, "24 m"], [36, "36 m"], [48, "48 m"]]} /></span>
            <span><span style={{ fontSize: 11, color: AF.grayMid, marginRight: 8 }}>{T.size}</span><Seg value={sz} onChange={setSz} options={[["<250", "< 250"], ["250-1000", "250–1,000"], [">1000", "> 1,000"]]} /></span>
            <span><span style={{ fontSize: 11, color: AF.grayMid, marginRight: 8 }}>{T.tier}</span><Seg value={tier} onChange={setTier} options={TIER_NAMES.map((n, k) => [k, `${n} · ${DISC[prog][k]}%`])} /></span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ border: `1px solid ${AF.border}`, borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 10, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{T.pub}</div><div style={{ fontSize: 22, fontWeight: 800, color: AF.black }}>{money(pub)}</div><div style={{ fontSize: 11, color: AF.grayMid }}>{sym}{(pub / tk * r).toFixed(2)} {T.perTk}</div></div>
          <div style={{ border: `1px solid ${AF.border}`, borderRadius: 10, padding: "12px 14px" }}><div style={{ fontSize: 10, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{T.part} · −{disc}%</div><div style={{ fontSize: 22, fontWeight: 800, color: AF.black }}>{money(part)}</div><div style={{ fontSize: 11, color: AF.grayMid }}>{sym}{(part / tk * r).toFixed(2)} {T.perTk}</div></div>
        </div>
        <div style={{ border: `2px solid ${AF.pink}`, borderRadius: 10, padding: "12px 16px", background: "#FFF5FA", marginTop: 10, display: "flex", alignItems: "center", gap: 14 }}><div style={{ flex: 1 }}><div style={{ fontSize: 10, color: AF.pink, textTransform: "uppercase", letterSpacing: "0.05em" }}>{T.yourMargin}</div><div style={{ fontSize: 26, fontWeight: 800, color: AF.pink }}>{money(pub - part)}</div></div><div style={{ fontSize: 11, color: AF.grayMid, textAlign: "right", lineHeight: 1.5 }}>{fmtN(tk)} tk · {m} {T.months}<br />{sz} {T.employees}</div></div>
        <div style={{ border: `1px solid ${AF.border}`, borderRadius: 10, overflow: "hidden", marginTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: ".9fr 1fr .7fr 1fr .7fr 1.2fr", padding: "7px 12px", background: AF.grayLight, fontSize: 9.5, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase" }}>{T.keyRows.map((k, ki) => <span key={ki}>{k}</span>)}<span style={{ gridColumn: "1 / -1", fontWeight: 400, textTransform: "none", fontSize: 9.5, marginTop: 2 }}>{m} {T.months} · {sz} {T.employees} · {TIER_NAMES[tier]} −{disc}%</span></div>
          {key.map((k) => { const pk = publicPrice(k, m, sz), pp = pk * (1 - disc / 100); return <div key={k} onClick={() => setI(PRICE.findIndex((p) => p[0] === k))} style={{ display: "grid", gridTemplateColumns: ".9fr 1fr .7fr 1fr .7fr 1.2fr", padding: "7px 12px", borderTop: `1px solid ${AF.border}`, fontSize: 11.5, cursor: "pointer", background: tk === k ? "#FFF5FA" : "#fff" }}><b>{fmtN(k)}</b><span>{money(pk)}</span><span style={{ color: AF.grayMid }}>{sym}{(pk / k * r).toFixed(2)}</span><span style={{ color: AF.pink }}>{money(pp)}</span><span style={{ color: AF.grayMid }}>{sym}{(pp / k * r).toFixed(2)}</span><b style={{ color: AF.black }}>{money(pk - pp)}</b></div>; })}
          <div style={{ display: "grid", gridTemplateColumns: ".9fr 4.6fr", padding: "7px 12px", borderTop: `1px solid ${AF.border}`, fontSize: 11.5, color: AF.grayMid }}><b style={{ color: AF.black }}>&gt; 500,000</b><span>{T.custom}</span></div>
        </div>
      </div>
      <div style={{ border: `1px solid ${AF.border}`, borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: AF.black, marginBottom: 4 }}>{T.convT}</div><div style={{ fontSize: 11.5, color: AF.grayMid, lineHeight: 1.5, marginBottom: 12 }}>{T.convP}</div>
        {PRODUCTS.map((p) => <div key={p.id} onClick={() => setUse({ ...use, [p.id]: !use[p.id] })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 9, marginBottom: 6, cursor: "pointer", background: use[p.id] ? "#FFF5FA" : AF.grayLight, border: use[p.id] ? `1.5px solid ${AF.pink}` : "1.5px solid transparent" }}>
          <span style={{ width: 15, height: 15, borderRadius: 4, border: use[p.id] ? "none" : `2px solid ${AF.border}`, background: use[p.id] ? AF.pink : "#fff", color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{use[p.id] ? "✓" : ""}</span>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: p.grad, color: "#fff", fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{p.icon}</span>
          <b style={{ fontSize: 12, flex: 1 }}>{p.label}</b><span style={{ fontSize: 10.5, color: AF.grayMid }}>{prodTxt(p, lang).short}</span><span style={{ fontSize: 11, fontWeight: 700, color: AF.pink }}>{p.cost} tk</span>
        </div>)}
        <div style={{ background: AF.black, color: "#fff", borderRadius: 10, padding: "14px 16px", marginTop: 12 }}>
          <div style={{ fontSize: 10, color: "#9A9A9E", textTransform: "uppercase", letterSpacing: "0.05em" }}>{fmtN(tk)} tokens · {perPerson} {T.perPerson}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff" }}>{perPerson ? fmtN(tk / perPerson) : "—"} <span style={{ fontSize: 13, fontWeight: 500, color: "#B9B9BC" }}>{T.people}</span></div>
        </div>
      </div>
    </div>
  </Frame>);
};

/* ============ ACT 6 — ANNUAL BUSINESS CASE ============ */
const SIM_DEF = { rpo: { clients: 10, camps: 8, cands: 150 }, recruit: { clients: 6, camps: 6, cands: 40 }, consult: { clients: 4, camps: 3, cands: 60 } };
const MIX_DEF = { CVS: [false, 100], SCAN: [false, 100], SCANT: [false, 100], SWIPE: [false, 30], DRIVE: [false, 30], BRAIN: [false, 30], VOICE: [false, 15] };
const S_Simulator = ({ lang, prog, profile }) => {
  const T = L[lang].sim;
  const d = SIM_DEF[profile];
  const [cur, setCur] = useState("EUR"); const { s: sym, r } = CUR[cur];
  const [clients, setClients] = useState(d.clients), [camps, setCamps] = useState(d.camps), [cands, setCands] = useState(d.cands);
  const [usage, setUsage] = useState(MIX_DEF);
  const [months, setMonths] = useState(12), [sz, setSz] = useState("250-1000"), [tier, setTier] = useState(0), [resale, setResale] = useState(null);
  const perPerson = PRODUCTS.reduce((a, p) => a + (usage[p.id][0] ? usage[p.id][1] / 100 * p.cost : 0), 0);
  const rawPerClient = camps * cands * perPerson;
  const tkClient = Math.max(5000, Math.ceil(rawPerClient / 2500) * 2500);
  const tokens = clients * tkClient;
  const pubPerClient = publicPrice(tkClient, months, sz), pubPerTk = pubPerClient / tkClient;
  const rows = TIER_NAMES.map((n, idx) => ({ n, disc: DISC[prog][idx], cost: clients * pubPerClient * (1 - DISC[prog][idx] / 100) }));
  const rs = resale ?? pubPerTk, revenue = tokens * rs;
  const act = rows[tier], profit = revenue - act.cost, margin = revenue > 0 ? profit / revenue * 100 : 0;
  const fmt = (n) => { const v = n * r; return sym + (Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + "k" : fmtN(v)); };
  const setU = (id, on, pct) => setUsage({ ...usage, [id]: [on, pct] });
  return (
    <div style={{ background: "#fff", border: `1px solid ${AF.border}`, borderRadius: 12, minHeight: 500, padding: "28px 30px", fontFamily: AF.font, boxSizing: "border-box" }}>
      <div style={{ height: 4, width: 120, background: AF.gradient, borderRadius: 2, marginBottom: 14 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><h2 style={{ fontSize: 21, fontWeight: 700, color: AF.black, letterSpacing: "-0.02em", margin: 0 }}>{T.h}</h2><CurSwitch cur={cur} setCur={setCur} /></div>
      <p style={{ fontSize: 12, color: AF.grayMid, margin: "0 0 16px", maxWidth: 680, lineHeight: 1.55 }}>{T.p}</p>
      <div style={{ display: "flex", gap: 22 }}>
        <div style={{ flex: "0 0 300px" }}>
          <Kicker>{T.s1}</Kicker>
          <Slider label={T.clients} value={clients} onChange={setClients} min={1} max={25} />
          <Slider label={T.camps} value={camps} onChange={setCamps} min={1} max={20} />
          <Slider label={T.cands} value={cands} onChange={setCands} min={10} max={500} step={10} />
          <div style={{ marginTop: 4 }}><Kicker>{T.s2}</Kicker></div>
          <p style={{ fontSize: 10, color: "#98A2AE", margin: "0 0 8px", lineHeight: 1.4 }}>{T.s2n}</p>
          {PRODUCTS.map((p) => { const [on, pct] = usage[p.id]; return (
            <div key={p.id} style={{ background: on ? "#FFF5FA" : AF.grayLight, border: on ? `1.5px solid ${AF.pink}` : "1.5px solid transparent", borderRadius: 9, padding: "5px 10px", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span onClick={() => setU(p.id, !on, pct || 30)} style={{ width: 15, height: 15, borderRadius: 4, cursor: "pointer", border: on ? "none" : `2px solid ${AF.border}`, background: on ? AF.pink : "#fff", color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on ? "✓" : ""}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: on ? AF.black : AF.grayMid, flex: 1 }}>{p.label} <span style={{ fontWeight: 400, fontSize: 10, color: AF.grayMid }}>· {p.cost} tk</span></span>
                {on && <b style={{ fontSize: 11, color: AF.pink }}>{pct}%</b>}
              </div>
              {on && <input type="range" min={5} max={100} step={5} value={pct} onChange={(e) => setU(p.id, true, Number(e.target.value))} style={{ width: "100%", accentColor: AF.pink, marginTop: 3 }} />}
            </div>); })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", background: "linear-gradient(135deg, rgba(255,47,146,0.08), rgba(0,150,255,0.06))", border: `1.5px solid ${AF.pink}`, borderRadius: 12, padding: "14px 20px", marginBottom: 12 }}>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{T.vol}</div><div style={{ fontSize: 34, fontWeight: 800, color: AF.pink, lineHeight: 1.1 }}>{perPerson ? (tokens >= 1000 ? (tokens / 1000).toFixed(0) + "K" : fmtN(tokens)) : "—"} <span style={{ fontSize: 15, fontWeight: 700 }}>{T.volu}</span></div></div>
            <div style={{ marginLeft: "auto", fontSize: 10.5, color: AF.grayMid, textAlign: "right", lineHeight: 1.6 }}>{perPerson ? <>{fmtN(camps * cands)} {T.people} · {perPerson.toFixed(1)} {T.perPerson}<br />{fmtN(tkClient)} {T.perClient}{rawPerClient < 5000 ? ` (${T.minPack})` : ""}</> : T.none}</div>
          </div>
          <Kicker>{T.s3}</Kicker>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
            <span><span style={{ fontSize: 11, color: AF.grayMid, marginRight: 8 }}>{T.commit}</span><Seg value={months} onChange={(v) => { setMonths(v); setResale(null); }} options={[[12, "12 m"], [24, "24 m"], [36, "36 m"], [48, "48 m"]]} /></span>
            <span><span style={{ fontSize: 11, color: AF.grayMid, marginRight: 8 }}>{T.size}</span><Seg value={sz} onChange={(v) => { setSz(v); setResale(null); }} options={[["<250", "< 250"], ["250-1000", "250–1,000"], [">1000", "> 1,000"]]} /></span>
          </div>
          <div style={{ border: `1px solid ${AF.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr 1fr 1fr .8fr", padding: "8px 12px", background: AF.grayLight, fontSize: 9.5, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.05em" }}>{T.tCols.map((c) => <span key={c}>{c}</span>)}</div>
            {rows.map((row, idx) => { const pr = revenue - row.cost; const on = idx === tier; return (
              <div key={row.n} onClick={() => setTier(idx)} style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr 1fr 1fr .8fr", padding: "9px 12px", fontSize: 12, borderTop: `1px solid ${AF.border}`, background: on ? "#FFF5FA" : "#fff", cursor: "pointer", boxShadow: on ? `inset 3px 0 0 ${AF.pink}` : "none", alignItems: "center" }}>
                <span><b>{row.n}</b>{on && <span style={{ fontSize: 8.5, fontWeight: 800, color: "#fff", background: AF.pink, borderRadius: 8, padding: "2px 7px", marginLeft: 6, textTransform: "uppercase" }}>{T.best}</span>}</span><span>−{row.disc}%</span><span>{fmt(row.cost)}</span><b style={{ color: AF.pink }}>{fmt(pr)}</b><span>{revenue > 0 ? (pr / revenue * 100).toFixed(0) : "—"}%</span>
              </div>); })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11.5, color: AF.grayMid }}>{T.resale}</span>
            <Seg value={resale !== null ? "custom" : "public"} onChange={(v) => { if (v === "custom") setResale(rs); else setResale(null); }} options={T.rmodes} />
            <input type="number" step={0.01} min={0.1} value={Number((rs * r).toFixed(2))} onChange={(e) => setResale(Number(e.target.value) / r)} style={{ width: 66, fontSize: 12, fontWeight: 700, color: AF.black, border: `1px solid ${AF.pink}`, borderRadius: 6, padding: "4px 6px", textAlign: "center", fontFamily: AF.font }} /><span style={{ fontSize: 11, color: AF.grayMid }}>{sym} / tk</span>
          </div>
          <div style={{ fontSize: 11, color: AF.black, background: AF.grayLight, borderRadius: 8, padding: "8px 12px", marginBottom: 12, lineHeight: 1.5 }}>{perPerson ? T.how(resale !== null, sym + (rs * r).toFixed(2), sym + (act.cost / tokens * r).toFixed(2), act.disc) : T.resaleHint}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
            {[[T.kpis[0], fmt(revenue)], [T.kpis[1] + " · " + act.n, fmt(act.cost)], [T.kpis[2], fmt(profit)], [T.kpis[3], margin.toFixed(0) + "%"]].map(([t, v]) => <div key={t} style={{ background: "#FDF7FB", border: `1px solid ${AF.pink}`, borderRadius: 10, padding: "11px 13px" }}><div style={{ fontSize: 9.5, fontWeight: 700, color: AF.grayMid, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t}</div><div style={{ fontSize: 19, fontWeight: 800, color: AF.pink, marginTop: 2 }}>{perPerson ? v : "—"}</div></div>)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: AF.grayLight, borderRadius: 10, padding: "10px 14px" }}>
            <span style={{ fontSize: 11.5, color: AF.black, lineHeight: 1.5, flex: 1 }}>{T.services}</span>
            <AfCta small href={BOOKING_URL}>{T.cta}</AfCta>
          </div>
        </div>
      </div>
    </div>
  );
};

const S_Call = ({ lang, restart }) => {
  const T = L[lang].road;
  return (<Frame dark>
    <div style={{ height: 4, width: 120, background: AF.gradient, borderRadius: 2, marginBottom: 22 }} />
    <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 10px", maxWidth: 640 }}>{T.cH}</h2>
    <p style={{ color: "#B9B9BC", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px", maxWidth: 620 }}>{T.cP}</p>
    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
      <AfCta href={BOOKING_URL}>{T.cta}</AfCta>
      <span style={{ color: "#B9B9BC", fontSize: 12.5 }}>{T.mail} <a href={`mailto:${PARTNERS_MAIL}`} style={{ color: "#fff" }}>{PARTNERS_MAIL}</a></span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "36px 0 28px", maxWidth: 760 }}>
      {[["3,500+", lang === "fr" ? "clients dans 40+ pays" : "clients in 40+ countries"], ["39", lang === "fr" ? "langues" : "languages"], ["4.9/5", lang === "fr" ? "expérience candidat · 2 700+ avis Google" : "candidate experience · 2,700+ Google reviews"]].map(([v, l]) => <div key={l} style={{ background: "#2A2A2C", borderRadius: 12, padding: "16px 18px" }}><div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{v}</div><div style={{ fontSize: 11, color: "#B9B9BC", marginTop: 3 }}>{l}</div></div>)}
    </div>
    <button onClick={restart} style={{ background: "transparent", border: "1px solid #48484A", color: "#D9D9DC", borderRadius: 8, padding: "10px 20px", fontFamily: AF.font, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>{T.restart}</button>
    <p style={{ color: "#6E6E73", fontSize: 10.5, marginTop: 24 }}>AssessFirst Partner Programme · Decide with confidence.</p>
  </Frame>);
};


/* ============ TOUR SHELL ============ */
const buildSteps = (prog) => {
  const resell = isResell(prog);
  return [
    { act: 0, label: "Welcome", C: S_Welcome },
    { act: 1, label: "Pick your programme", C: S_Choose },
    { act: 1, label: "How it works", C: S_Detail },
    ...(resell ? [{ act: 1, label: "Tiers & MDF", C: S_Tiers }] : [{ act: 1, label: "Your reward", C: S_Reward }]),
    { act: 1, label: "Portal & rules", C: S_Portal },
    { act: 1, label: resell ? "Partner back-office" : "Leads & commissions", C: resell ? S_BackOffice : S_Leads },
    { act: 2, label: "Seven tools, one token", C: S_Products },
    { act: 2, label: "In your missions", C: S_Fit },
    ...(resell ? [{ act: 2, label: "Your margin", C: S_Margin }] : []),
    ...(resell ? [{ act: 3, label: "How you order", C: S_Modes }, { act: 3, label: "Public price grid", C: S_Grid }, { act: 3, label: "Your year", C: S_Simulator }]
      : [{ act: 3, label: "Commission calculator", C: S_Commission }, { act: 3, label: "Your year", C: S_YearComm }]),
    { act: 4, label: "First 90 days", C: S_Roadmap },
    { act: 4, label: "Book a call", C: S_Call },
  ];
};
const urlProg = () => { try { const m = window.location.search.match(/prog=(\w+)/); return m && PROGS.includes(m[1]) ? m[1] : null; } catch { return null; } };
const ProgSwitch = ({ lang, prog, onChange }) => (
  <select value={prog} onChange={(e) => onChange(e.target.value)} style={{ fontFamily: AF.font, fontSize: 11, fontWeight: 700, color: AF.pink, background: "#FFF5FA", border: `1px solid ${AF.pink}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}>
    {PROGS.map((p) => <option key={p} value={p}>{pgName(lang, p)}</option>)}
  </select>
);
const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} } };
const isInternal = () => { try { return /mode=internal|#internal/.test(window.location.href); } catch { return false; } };
const PinGate = ({ onOk }) => {
  const [pin, setPin] = useState(""); const [err, setErr] = useState(false);
  const submit = () => { if (pin.trim().toUpperCase() === "AF2026") { store.set("af_rd_auth", "1"); onOk(); } else { setErr(true); setPin(""); } };
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: AF.font, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <AfMark size={64} />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: AF.black, margin: "18px 0 4px", letterSpacing: "-0.02em" }}>AssessFirst Partner Programme</h1>
        <p style={{ fontSize: 13, color: AF.grayMid, margin: "0 0 24px" }}>Partner journey — enter your access code</p>
        <input type="password" value={pin} autoFocus onChange={(e) => { setPin(e.target.value); setErr(false); }} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Access code" style={{ fontFamily: AF.font, fontSize: 15, padding: "12px 16px", borderRadius: 8, border: err ? `2px solid ${AF.pink}` : `1px solid ${AF.border}`, outline: "none", textAlign: "center", width: 220, display: "block", margin: "0 auto 6px" }} />
        <div style={{ fontSize: 12, color: AF.pink, minHeight: 18 }}>{err ? "Incorrect code, please try again." : ""}</div>
        <div style={{ marginTop: 8 }}><AfCta onClick={submit}>Enter</AfCta></div>
      </div>
    </div>
  );
};


export default function App() {
  const [authed, setAuthed] = useState(() => store.get("af_rd_auth") === "1");
  const [lang, setLang] = useState("en");
  const [profile, setProfile] = useState("recruit");
  const [prog, setProgRaw] = useState(() => urlProg() || "reseller");
  const [hov, setHov] = useState(null);
  const [i, setI] = useState(0);
  const internal = useMemo(isInternal, []);
  const STEPS = useMemo(() => buildSteps(prog), [prog]);
  const setProg = (p) => { const cur = STEPS[Math.min(i, STEPS.length - 1)]; const ns = buildSteps(p); let k = ns.findIndex((st) => st.label === cur.label); if (k < 0) k = ns.findIndex((st) => st.act === cur.act); setProgRaw(p); setI(Math.max(0, k)); };
  if (!authed) return <PinGate onOk={() => setAuthed(true)} />;
  const N = L[lang].nav, H = L[lang].hdr;
  const idx = Math.min(i, STEPS.length - 1), step = STEPS[idx];
  const Screen = step.C;
  const next = () => setI((v) => Math.min(v + 1, STEPS.length - 1));
  const prev = () => setI((v) => Math.max(v - 1, 0));
  const restart = () => setI(0);
  const props = { next, restart, lang, profile, setProfile, prog, setProg, internal, steps: STEPS, goto: (k) => setI(k) };
  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: AF.font, padding: "0 0 40px" }}>
      <div style={{ height: 5, background: AF.gradient }} />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "26px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
          <div>
            <AfLogo size={20} />
            <h1 style={{ fontSize: 24, fontWeight: 700, color: AF.black, margin: "14px 0 2px", letterSpacing: "-0.02em" }}>AssessFirst Partner Programme <span style={{ color: AF.grayMid, fontWeight: 400 }}>— {H.title}</span></h1>
            <p style={{ fontSize: 13, color: AF.grayMid, margin: 0 }}>{H.sub}</p>
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: AF.grayMid }}>
            <div style={{ marginBottom: 6, display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>{internal && <span style={{ fontSize: 9.5, fontWeight: 700, color: "#fff", background: AF.black, borderRadius: 8, padding: "3px 8px", textTransform: "uppercase" }}>internal</span>}<ProgSwitch lang={lang} prog={prog} onChange={setProg} /><LangSwitch lang={lang} setLang={setLang} /></div>
            {step.act > 0 ? `${N.act} ${step.act} / 4` : N.intro}<br /><b style={{ color: AF.black }}>{H.acts[step.act]}</b>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, margin: "18px 0 16px" }}>
          {STEPS.map((s, k) => (
            <div key={k} onClick={() => setI(k)} onMouseEnter={() => setHov(k)} onMouseLeave={() => setHov(null)} style={{ flex: 1, position: "relative", padding: "6px 0", marginLeft: k > 0 && s.act !== STEPS[k - 1].act ? 8 : 0, cursor: "pointer" }}>
              <div style={{ height: 6, borderRadius: 3, background: k <= idx ? AF.pink : AF.grayLight, opacity: k === idx ? 1 : k < idx ? 0.55 : 1, transform: hov === k ? "scaleY(1.5)" : "none", transition: "background .3s, transform .15s" }} />
              {hov === k && <div style={{ position: "absolute", bottom: "calc(100% + 2px)", left: "50%", transform: "translateX(-50%)", background: AF.black, color: "#fff", fontSize: 10.5, fontWeight: 600, borderRadius: 7, padding: "5px 10px", whiteSpace: "nowrap", zIndex: 20, pointerEvents: "none", boxShadow: "0 6px 18px rgba(0,0,0,0.22)" }}>{s.act > 0 ? `${s.act}.` : ""} {s.label}<span style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", border: "4px solid transparent", borderTopColor: AF.black }} /></div>}
            </div>))}
        </div>
        <Screen {...props} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
          <button onClick={prev} disabled={idx === 0} style={{ background: "#fff", border: `1px solid ${AF.border}`, borderRadius: 8, padding: "10px 22px", fontFamily: AF.font, fontWeight: 400, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.06em", color: AF.black, cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.4 : 1 }}>{N.back}</button>
          <span style={{ fontSize: 12, color: AF.grayMid }}>{idx + 1} / {STEPS.length} — {step.label}</span>
          {idx < STEPS.length - 1 ? <AfCta onClick={next}>{N.next}</AfCta> : <AfCta onClick={restart}>{N.restart}</AfCta>}
        </div>
      </div>
    </div>
  );
}
