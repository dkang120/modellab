# Who ModelLab's simulated users are, and why

This is the research behind the simulated-user test. Each finding feeds one or more dials in `generate.mjs`, which mixes them into thousands of distinct people.

**Ground rule: individuals, not stereotypes.** Differences within any group are far bigger than differences between groups. Demographics only nudge probabilities a little (e.g. slightly more likely to have started with crypto). They never decide who a persona is, and personas are told not to act out their demographics. Most real people never mention their race in a money text, so most personas don't either.

## Who Gen Z is
- **Most diverse US generation.** Pew (Census data): 52% non-Hispanic white, 25% Hispanic, 14% Black, 4% Asian, 4% two or more races. → race/ethnicity weights in `generate.mjs`.
- **Mostly metro.** Only 13% of Gen Z live in rural America (Pew). → setting weights (urban/suburban/rural).
- **Large share have immigrant parents** (second generation). → family background dial, heritage, bilingual code-switching. *Exact share not verified here; weight is an estimate.*
- **LGBTQ+ identification is much higher in Gen Z than in older generations.** *Exact share not verified here; weight is an estimate.*

## How Gen Z invests
- **Social media is a main teacher.** 48% of US Gen Z investors use social media to learn about investing (FINRA Foundation + CFA Institute, 2023). YouTube, Instagram and TikTok are the top three platforms. YouTube is the most-used platform for investing (30% overall, 60%+ among young people; FINRA NFCS 2024). → info-source dial, finfluencer/FOMO scenarios.
- **Crypto first.** 44% of US Gen Z investors started with crypto, vs 35% of millennials and 23% of Gen X (FINRA/CFA). → first-asset dial, crypto scenarios.
- **Fewer brand-new investors now.** Only 8% started in the two years before 2024, vs 21% in 2021 (FINRA NFCS 2024). Many who entered in 2019–21 later pulled back. → "burned before, came back" backstory.
- **Investors of color skew younger and newer, and lean on apps.** Nearly half of Black investors and 38% of Hispanic investors had under two years of experience. Share who researched investments on a mobile trading app: Black 65%, Hispanic 58%, Asian/Pacific Islander 45%, white 33% (FINRA Foundation, Investors of Color, 2024). → small nudges on experience and app use.
- **Trust gap.** Black Americans who never invested or pulled out more often cited lack of trust in the market (36% vs 29% for white Americans) and in financial institutions (25% vs 19%) (Ariel-Schwab, 2022). → skeptic/trust dial (small nudge; skepticism appears across every group).
- **Values matter.** 44% of Black investors call aligning investments with personal beliefs very important, vs 29% of white investors (Ariel-Schwab). 71% of women under 30 prefer companies that support their values (BNY Mellon via Motley Fool). → values/ESG questions.

## Gender
- **Confidence gap, not ability gap.** Most saving and investing differences between men and women disappear once income is controlled for. What remains is attitude: humility, composure, a confidence gap (Morningstar, Newcomb 2022). Men trade more, which lowers their net returns (Barber & Odean 2001). → overconfidence slightly more likely for men, under-confidence slightly more likely for women; both appear in every gender.
- **Young women are closing the gap.** 77% of Gen Z women own stock-market investments (Fidelity 2024). Among Gen Z investors, 63% of women vs 51% of men have a written financial plan (M1). Women trade 44% less often (Vanguard). → plenty of confident, planned young women; the "nervous woman" trope is not the default.
- **Young men drive the retail-trading surge.** Investing among 25-year-olds rose from 6% (2015) to 37% (2024), led by Gen Z men (JPMorgan, via Fortune). → hype, options and trading scenarios lean a little male, without being exclusive.

## Money stress
- **Gen Z is the most money-stressed generation.** 62% feel stressed about money more than three days a week and 20% feel financial anxiety every day (Motley Fool Money 2024). 39% of Gen Z feel depressed or anxious at least weekly because of financial uncertainty (Northwestern Mutual 2025). → emotional-state dial; anxiety is common, crisis is rare.
- **Pressure to look fine.** 53% of Gen Z (TD, Canada) feel pressure to project financial success, especially on social media. → people who downplay struggles at first.
- **LGBTQ+ adults report more financial strain.** About 48% say they're financially unwell vs about 26% of the general public, and it's higher for ages 18–24 and BIPOC LGBTQ+ adults. 31% have faced discrimination in financial services (HRC). → financial-strain nudge; identity is rarely mentioned in chat.

## Culture and family
- **Family obligation.** Many children of immigrants send money home or help support parents. The guilt of saying no and becoming "the family's retirement plan" is a recurring theme (diaspora finance research and practitioner accounts). 25–34-year-olds are now the largest group of remittance senders (30%) (remittance report via American Bazaar). → "sending money home" and family-pressure scenarios.
- **Faith-based rules.** Many Muslim Americans avoid riba (interest), both paid and earned, so standard savings accounts, bonds and many default funds don't fit. Some avoid investing entirely out of fear it's haram. → halal questions from Muslim personas; the buddy should respect the constraint, not dismiss it.
- **Unbanked and underbanked families.** Unbanked rates are higher in immigrant communities (Bohn & Pearlman 2013). → some personas come from cash-based households and lack basic product knowledge.

## How Gen Z texts
- Periods read as cold or irritated. Texts ending in a period were rated less sincere (Binghamton University). → personas mostly skip periods; formal texters are a minority.
- Emoji are used ironically. 😭 means laughing for many Gen Z texters, unlike 😂 for Gen X (UCLA Languaged Life), and 💀 means "dead (laughing)". → emoji style dial.
- Some bilingual young people code-switch (Spanglish, Taglish, Konglish and so on). → code-switching for some second-generation personas.

## Behavioral-finance biases used across all groups
Loss aversion (Kahneman & Tversky), myopic loss aversion (Benartzi & Thaler), overconfidence (Barber & Odean), herding/social proof, recency and extrapolation, disposition effect (Shefrin & Statman), choice overload (Iyengar & Lepper), present bias, mental accounting (Thaler), ambiguity aversion, status quo bias, chasing losses. These are human, not demographic: every group gets every bias.

## What this test can and can't tell you
- It **can** show how the buddy handles many kinds of people and moods, and flag groups it connects with worse (the report's fairness table).
- It **can't** replace real users. Personas are an AI's model of people, built on the research above. Real signups have to confirm anything important.
- Numbers from this test are **simulated** and should always be described that way.

## Sources
- FINRA Foundation & CFA Institute, *Gen Z and Investing: Social Media, Crypto, FOMO, and Family* (2023)
- FINRA Foundation, *Investors in the United States* (NFCS 2024, Dec 2025); *Investors of Color in the United States* (2024)
- Ariel-Schwab Black Investor Survey (2020, 2022)
- Morningstar, "Why Do Women Invest Less? Blame the Income Gap" (Newcomb, 2022)
- Fidelity Women & Investing Study (2024); M1 Gen Z investor research; Vanguard trading data
- JPMorgan Chase Institute retail-investing research (via Fortune, Aug 2025)
- Motley Fool Money Financial Stress Survey (2024); Northwestern Mutual Planning & Progress (2025); TD Gen Z survey (2025)
- Human Rights Campaign, LGBTQ+ financial wellness data
- Pew Research Center, Gen Z demographic analyses (2018–2019)
- Barber & Odean (2001); Kahneman & Tversky (1979); Benartzi & Thaler (1995); Shefrin & Statman (1985); Iyengar & Lepper (2000); Thaler (1985)
- UCLA Languaged Life texting studies; Binghamton University punctuation study
