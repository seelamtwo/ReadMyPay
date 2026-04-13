export type FaqPair = { question: string; answer: string };

/**
 * FAQPage JSON-LD data per static blog slug (see BlogFaqJsonLd).
 */
export const BLOG_FAQ_SCHEMA_BY_SLUG: Record<string, FaqPair[]> = {
  "pay-stub-every-line-explained": [
    {
      question:
        "What is the difference between gross pay and net pay on a pay stub?",
      answer:
        "Gross pay is the total amount you earned before anything is taken out — your full salary or hourly wages for that pay period. Net pay, sometimes called take-home pay, is what actually gets deposited into your bank account after all taxes and deductions have been removed. The difference between the two is made up of federal and state income taxes, Social Security, Medicare, and any deductions for health insurance or retirement contributions you have enrolled in.",
    },
    {
      question: "What does FICA mean on my pay stub?",
      answer:
        "FICA stands for Federal Insurance Contributions Act. It refers to two separate deductions on your pay stub: Social Security tax and Medicare tax. Social Security takes 6.2% of your gross wages up to an annual limit, and Medicare takes 1.45% with no cap. These contributions fund the Social Security retirement program and Medicare healthcare coverage you will be eligible for later in life. Unlike income tax, you cannot change the amount withheld for FICA — it is a fixed percentage required by law for all working Americans.",
    },
    {
      question: "What does YTD mean on a pay stub?",
      answer:
        "YTD stands for Year to Date. It shows the running total of your earnings, taxes, and deductions from January 1st of the current year through your most recent paycheck. Most pay stubs show two columns side by side: the current pay period amount and the YTD total. The YTD column is useful at tax time for verifying that the numbers on your W2 form match your own records, and for checking that you have not accidentally exceeded the annual contribution limit for your 401(k) retirement account.",
    },
    {
      question: "Why is federal income tax withheld from every paycheck?",
      answer:
        "Federal income tax is withheld from each paycheck as a way of paying your annual tax bill in small installments throughout the year rather than in one large payment every April. The amount withheld is determined by the W-4 form you filled out when you started your job, which tells your employer how much to set aside based on your filing status and any additional withholding you requested. If too much is withheld over the year, you receive a tax refund when you file. If too little is withheld, you will owe the difference when you file your return.",
    },
    {
      question: "What should I do if something on my pay stub looks wrong?",
      answer:
        "If you notice a deduction you do not recognize, an amount that looks incorrect, or a line that does not match what you signed up for, contact your employer's HR or payroll department as soon as possible. Payroll errors do occur, and the sooner you report them the easier they are to correct. Keep a copy of the pay stub in question and note the specific line and amount that appears incorrect. Your employer is required by law to correct payroll mistakes. If you need help understanding what each line on your pay stub means before contacting HR, you can upload your pay stub to ReadMyPay.com for a plain English explanation of every item — your document is never stored or saved.",
    },
  ],
  "what-is-w2-form-january": [
    {
      question: "What is a W2 form and why do I receive it every January?",
      answer:
        "A W2 is an official tax document your employer sends you at the end of each year. It summarizes your total earnings and all taxes withheld from your paychecks during that year. Your employer is required by law to send it by January 31st. You need your W2 to file your federal and state income tax return. If you had more than one employer during the year, you will receive a separate W2 from each one.",
    },
    {
      question: "Why is the amount in Box 1 of my W2 lower than my total salary?",
      answer:
        "Box 1 shows your taxable wages, which is not the same as your total gross salary. Certain pre-tax deductions are subtracted before Box 1 is calculated. These include contributions to a 401(k) retirement account and health insurance premiums paid through your employer. Because these deductions reduce your taxable income, Box 1 will be lower than your actual total earnings for the year. This is normal and correct.",
    },
    {
      question: "What does Box 2 on a W2 mean?",
      answer:
        "Box 2 shows the total amount of federal income tax withheld from your paychecks throughout the entire year. When you file your tax return, the IRS compares what you actually owe in taxes against the amount in Box 2. If Box 2 is more than what you owe, you receive a refund. If it is less, you will owe the difference. Box 2 is one of the most important numbers on your W2 for determining your tax outcome.",
    },
    {
      question: "What are the letter codes in Box 12 of my W2?",
      answer:
        "Box 12 uses letter codes to report specific types of compensation or benefits. The most common ones are: Code D, which means you made contributions to a 401(k) retirement plan; Code DD, which shows the total cost of employer-sponsored health coverage; and Code W, which represents contributions to a Health Savings Account. You generally do not need to do anything manually with these codes — your tax software or tax preparer knows how to handle them when you enter your W2 information.",
    },
    {
      question: "What should I do if my W2 has an error on it?",
      answer:
        "First, check that your name, address, and Social Security number are correct. If any of these are wrong, contact your employer's HR or payroll department immediately, as errors can cause problems with the IRS. If the income amounts look incorrect, compare Box 1 against your final pay stub of the year to look for discrepancies. Your employer can issue a corrected W2, called a W2-C, to fix mistakes. Do not file your tax return with a W2 you believe contains errors — wait for the corrected version.",
    },
  ],
  "is-it-safe-upload-financial-documents-online": [
    {
      question:
        "Is it safe to upload my pay stub or tax documents to a website?",
      answer:
        "It depends entirely on how the website handles your document. Sites that store your uploaded files on their servers create a risk because stored data can be breached, sold, or accessed without your knowledge. Sites that process your document in your browser without storing it are significantly safer. Before uploading any financial document, look for a clear privacy policy that explicitly states your document is not stored, and check that the site uses HTTPS encryption, shown by a padlock icon in your browser's address bar.",
    },
    {
      question:
        "What does browser-only processing mean for document privacy?",
      answer:
        "Browser-only processing means your document is read and analyzed on your own device rather than being sent to and stored on a company's server. Think of it like opening a PDF on your computer — the file stays with you and goes nowhere. When a tool uses browser-only processing, there is nothing stored on the company's end that could be hacked, sold, or accidentally exposed. ReadMyPay.com uses this approach so your financial documents never leave your control.",
    },
    {
      question:
        "How do I know if an online tool is storing my financial documents?",
      answer:
        "Read the privacy policy carefully before uploading anything. Look specifically for language about data retention — how long they keep your files — and whether your documents are used to train AI systems. If the privacy policy is vague, hard to find, or does not directly address document storage, treat that as a warning sign. A trustworthy tool will state clearly and plainly what is stored and what is not, without requiring you to read through legal language to find the answer.",
    },
    {
      question:
        "What information is typically on a pay stub that makes it sensitive?",
      answer:
        "A pay stub contains your full name, home address, employer name, Social Security number (sometimes partially masked), exact income, tax withholding details, and information about your health insurance and retirement contributions. This combination of information could be used for identity theft if it fell into the wrong hands. This is why it is important to be selective about which online tools you trust with these documents, and to avoid emailing pay stubs or uploading them to services without clear privacy protections.",
    },
    {
      question: "Are AI tools that read financial documents safe to use?",
      answer:
        "They can be, but the safety depends on the specific agreements between the tool and the AI service it uses. The key thing to look for is whether the AI service operates under a zero data retention policy, which means it processes your document to generate an answer and then immediately discards the content without storing or using it for training. ReadMyPay.com uses an AI service under exactly this kind of policy. If a tool cannot explain its AI data handling in plain language, that is a reason to be cautious.",
    },
  ],
  "what-is-1099-form-guide": [
    {
      question: "What is a 1099 form and who receives one?",
      answer:
        "A 1099 is an income reporting form used to report money you received that did not have taxes automatically withheld. Unlike a W2 from an employer, a 1099 is sent by clients, banks, government agencies, or investment firms. You may receive a 1099 if you did freelance or contract work, received Social Security benefits, earned interest from a bank account, took money out of a retirement account, or received dividend payments from investments. If you received $600 or more from a single source that does not withhold taxes, you will typically receive a 1099.",
    },
    {
      question: "What is the difference between a 1099-NEC and a 1099-MISC?",
      answer:
        "A 1099-NEC reports nonemployee compensation — money paid to you for freelance work, contract services, or independent consulting. A 1099-MISC is used for other types of miscellaneous income such as rent payments, prizes, awards, and certain legal settlements. If you did contract or freelance work for a company and were paid $600 or more, you should receive a 1099-NEC from that company by January 31st. Both forms report income that the IRS already knows about, so it must be included on your tax return.",
    },
    {
      question: "Do I have to pay taxes on money reported on a 1099?",
      answer:
        "Yes, income reported on a 1099 is generally taxable. Because no taxes were withheld when you received the money, you are responsible for paying those taxes when you file your return. If you received 1099-NEC income from self-employment or contract work, you may also owe self-employment tax, which covers your Social Security and Medicare contributions. This is why some people who receive 1099 income owe money at tax time — the taxes were not taken out in advance the way they are from a regular paycheck.",
    },
    {
      question:
        "What is a 1099-SSA and do I owe taxes on Social Security benefits?",
      answer:
        "A 1099-SSA is sent by the Social Security Administration each January and shows the total Social Security retirement or disability benefits you received during the year. Whether those benefits are taxable depends on your total income from all sources. If Social Security is your only income, it is generally not taxable. However, if you have additional income from a pension, retirement account withdrawals, or other sources, a portion of your Social Security benefits may be taxable. Your tax preparer or tax software will calculate this based on your full financial picture.",
    },
    {
      question:
        "What should I do if I receive a 1099 I do not recognize or did not expect?",
      answer:
        "Do not ignore a 1099 even if you think it was sent in error. The company or institution that sent it to you also sent a copy directly to the IRS, which means the IRS is expecting to see that income on your tax return. If you believe the 1099 is incorrect, contact the issuer to request a corrected form. If you simply do not understand what the income represents, a tax preparer can help you identify it. You can also upload the 1099 to ReadMyPay.com to get a plain English explanation of every box before deciding what to do.",
    },
  ],
  "bank-statement-lines-explained": [
    {
      question:
        "What is the difference between my available balance and my statement balance?",
      answer:
        "Your statement balance is the official balance at the end of your bank statement period, reflecting only fully completed transactions. Your available balance, shown in your bank's app or website, is a real-time figure that accounts for pending transactions — charges that have been authorized but not yet fully processed. The two numbers can differ by a few dollars or more depending on recent activity. The statement balance is the one used for official purposes such as loan applications.",
    },
    {
      question: "What does ACH mean on a bank statement?",
      answer:
        "ACH stands for Automated Clearing House. It is the electronic network used in the United States to process bank transfers, direct deposits, and automatic bill payments. When you see ACH on your bank statement, it simply means the transaction was processed electronically rather than by check or debit card. ACH deposits are typically direct deposits from employers or government agencies. ACH debits are usually automatic bill payments or transfers you authorized. ACH is not a company name — it describes the method used to move the money.",
    },
    {
      question:
        "How do I spot errors or fraudulent charges on my bank statement?",
      answer:
        "Review your statement each month and compare every transaction against your own memory and receipts. Look for merchants you do not recognize, duplicate charges for the same amount, transactions in locations you have never visited, or small recurring charges you did not authorize. Fraudsters sometimes test stolen card numbers with very small charges before making larger ones. If you spot anything suspicious, contact your bank immediately. Federal law gives you limited time to dispute unauthorized charges, so timely review matters.",
    },
    {
      question: "What are the most common bank fees and can I avoid them?",
      answer:
        "The most common bank fees are monthly maintenance fees, overdraft fees, and out-of-network ATM fees. Monthly maintenance fees are often waived if you maintain a minimum balance or set up direct deposit — check your account terms. Overdraft fees occur when you spend more than your available balance; linking a savings account as overdraft protection can reduce these. ATM fees are avoided by using only your bank's own ATMs or choosing a bank that reimburses ATM fees. If you are being charged fees you did not expect, call your bank and ask them to explain or waive them.",
    },
    {
      question:
        "Can I upload multiple bank statements to understand my spending patterns?",
      answer:
        "Yes. Uploading several months of bank statements at once gives you a much more accurate picture of your spending than a single month. Patterns like recurring subscriptions, seasonal spending, and gradual increases in certain categories only become visible when you look at three to six months together. ReadMyPay.com allows you to upload multiple bank statements and receive a combined spending breakdown by category, shown as a visual chart. Your statements are never stored — everything is processed privately and discarded after your session.",
    },
  ],
  "social-security-statement-earnings-record": [
    {
      question: "How do I get my Social Security statement?",
      answer:
        "You can access your Social Security statement at any time by creating a free account at ssa.gov and visiting the my Social Security portal. Once logged in, you can view and download your statement, which includes your full earnings history and estimated benefit amounts. If you are 60 or older and not yet receiving benefits, the Social Security Administration also mails paper statements periodically. Reviewing your statement regularly is important because errors in your earnings record can reduce your future benefits.",
    },
    {
      question: "What is the best age to start claiming Social Security benefits?",
      answer:
        "There is no single right answer — it depends on your health, financial situation, and whether you have a spouse who also receives benefits. You can claim as early as age 62, but your monthly benefit will be permanently reduced by up to 30% compared to waiting until your full retirement age. If you delay claiming past your full retirement age up to age 70, your benefit grows by approximately 8% per year. Someone who lives into their mid-80s or beyond typically receives more total money by waiting. Your Social Security statement shows estimated amounts at each claiming age to help you compare.",
    },
    {
      question:
        "What should I do if my Social Security earnings record has an error?",
      answer:
        "If you find a year with zero earnings or an amount lower than you believe you earned, you can request a correction from the Social Security Administration. You will need documentation such as old W2 forms, tax returns, or pay stubs from that period. Errors are easier to correct sooner rather than later because employers are only required to keep payroll records for a certain number of years. This is one of the main reasons financial experts recommend reviewing your Social Security statement every few years while you are still working.",
    },
    {
      question: "How is my Social Security benefit amount calculated?",
      answer:
        "Your Social Security retirement benefit is based on your highest 35 years of earnings, adjusted for inflation over time. The Social Security Administration calculates your Average Indexed Monthly Earnings, then applies a formula to produce your Primary Insurance Amount — the monthly payment you would receive at your full retirement age. If you worked fewer than 35 years, the missing years count as zero in the calculation, which lowers your benefit. Working longer, especially in higher-earning years, can meaningfully increase your monthly amount.",
    },
    {
      question:
        "Does my Social Security statement show disability and survivor benefits?",
      answer:
        "Yes. Your Social Security statement includes three separate benefit estimates: your retirement benefit at different claiming ages, an estimate of what you would receive if you became disabled and could no longer work, and survivor benefit estimates showing what your spouse or dependents would receive if you died. These numbers are worth knowing even if you hope never to need the disability or survivor amounts. They can inform decisions about life insurance, retirement planning, and how much financial protection your family currently has.",
    },
  ],
  "medicare-eob-explanation-of-benefits": [
    {
      question:
        "Is a Medicare Explanation of Benefits a bill I need to pay?",
      answer:
        "No. A Medicare Explanation of Benefits, also called an EOB or Medicare Summary Notice, is not a bill. It is a summary of medical claims submitted to Medicare on your behalf. It shows what was billed, what Medicare approved, what Medicare paid, and what you may be responsible for. If you owe any amount, a separate bill will come directly from your doctor or healthcare provider. Never send payment in response to receiving an EOB alone.",
    },
    {
      question: "How do I read a Medicare Summary Notice?",
      answer:
        "A Medicare Summary Notice lists each medical claim by date of service and provider. For each claim it shows four key amounts: the amount your provider billed, the Medicare-approved amount (which is usually lower because Medicare negotiates rates), the amount Medicare paid, and the amount you may owe. Focus on the last column — your potential responsibility. Compare it against any bills you have received from providers to verify the amounts match. If a provider bills you for more than your Medicare Summary Notice says you owe, contact Medicare.",
    },
    {
      question:
        "What is the difference between Original Medicare and Medicare Advantage for EOBs?",
      answer:
        "If you have Original Medicare (Part A and Part B), your EOB is called a Medicare Summary Notice and is sent by the federal government quarterly. If you have Medicare Advantage, also called Part C, your EOB comes from the private insurance company managing your plan and may look different in format. Both documents serve the same purpose — summarizing what was billed, what was paid, and what you may owe — but the branding, layout, and frequency of mailing can vary between Medicare Advantage plans.",
    },
    {
      question:
        "How do I spot a billing error or possible fraud on my Medicare statement?",
      answer:
        "When your Medicare Summary Notice or EOB arrives, compare every listed service against your own records. Ask yourself: did I actually see this provider on this date? Was this service performed? Does the description match what happened at my appointment? If you see a service you did not receive, a provider you never visited, or a date when you were not at a medical facility, report it to Medicare at 1-800-MEDICARE. Medicare fraud is unfortunately common and costs the healthcare system billions annually. Your report can make a difference.",
    },
    {
      question: "What is my right to appeal if Medicare denied a claim?",
      answer:
        "You have the right to appeal any Medicare decision to deny, reduce, or end coverage for a service you believe should be covered. Every EOB and Medicare Summary Notice includes information about your appeal rights and the deadline to file. These deadlines are important — missing them can forfeit your right to appeal. If you believe a claim was incorrectly denied or paid at the wrong amount, you can request a redetermination by contacting Medicare or your Medicare Advantage plan directly. AARP and local State Health Insurance Assistance Programs offer free help with Medicare appeals.",
    },
  ],
  "pension-statement-retirement-benefit": [
    {
      question: "What is the difference between a pension and a 401(k)?",
      answer:
        "A pension, formally called a defined benefit plan, promises you a specific monthly income in retirement based on your years of service and salary history. Your employer manages the investments and guarantees the payout regardless of market performance. A 401(k) is a defined contribution plan where you contribute money from your paycheck, it grows based on how investments perform, and your retirement income depends on the account balance you accumulate. Pensions provide more predictable income but are less common today than they were in previous decades.",
    },
    {
      question: "What does vested mean on a pension statement?",
      answer:
        "Vesting refers to the point at which you have legally earned the right to your pension benefit, even if you leave the employer. Some plans vest immediately, meaning you have a right to benefits from day one. Others use a graded vesting schedule where you earn an increasing percentage of your benefit over several years — for example, 20% after two years, 40% after three years, and so on up to 100%. If you leave before you are fully vested, you may forfeit some or all of your accrued benefit. Your pension statement will show your current vesting status.",
    },
    {
      question:
        "What is a joint-and-survivor annuity and should I choose it?",
      answer:
        "A joint-and-survivor annuity is a pension payout option that pays you a reduced monthly amount during your lifetime but continues paying a percentage — typically 50% or 75% — to your spouse after your death. A single-life annuity pays the highest monthly amount but stops entirely when you die. If your spouse depends on your pension income or has limited retirement income of their own, the joint-and-survivor option provides important financial protection. This decision is typically irreversible once your pension begins, so it deserves careful consideration before you retire.",
    },
    {
      question: "How is my monthly pension benefit calculated?",
      answer:
        "Most pensions use a formula that multiplies your years of service by a percentage multiplier by your average salary over a specified period, often your highest three or five years of earnings. For example, a plan with a 1.5% multiplier, 25 years of service, and a high-three average salary of $50,000 would produce an annual benefit of $18,750, or $1,562.50 per month. Your pension statement should show the specific formula your plan uses, your current accrued benefit, and your projected benefit if you continue working to normal retirement age.",
    },
    {
      question: "What happens to my pension if my employer goes out of business?",
      answer:
        "Most private-sector pension plans are insured by the Pension Benefit Guaranty Corporation, a federal agency. If your employer's pension plan fails, the PBGC steps in and pays your benefit up to a legal maximum, which is adjusted annually. Government and public sector pensions are generally backed by the government entity sponsoring them rather than the PBGC, and they are typically more secure. If you have concerns about your employer's pension health, you can review your plan's annual funding notice, which pension plans are required to send to participants each year.",
    },
  ],
  "what-is-irs-notice-tax-letter": [
    {
      question:
        "Does receiving a letter from the IRS mean I am in trouble?",
      answer:
        "Not necessarily. The IRS sends millions of letters every year for routine reasons that have nothing to do with audits or penalties. Many notices simply confirm that your return was received, notify you of a minor change to your refund, request verification of your identity, or ask you to provide documentation for a specific item. The notice itself will tell you exactly why it was sent and what, if anything, you need to do. Reading the notice carefully is always the right first step before drawing any conclusions.",
    },
    {
      question: "What is an IRS CP2000 notice?",
      answer:
        "A CP2000 is one of the most common IRS notices. It means the IRS found income on a W2 or 1099 that does not appear to match what you reported on your tax return. It is not an automatic finding that you owe money — it is a proposal asking you to review the discrepancy and either agree with the IRS's figures or explain why your return was correct. You must respond by the deadline stated in the notice. If you do owe additional tax, the notice will explain how to pay. If you disagree, you can write back with your explanation and supporting documents.",
    },
    {
      question: "What should I do first when I receive any IRS notice?",
      answer:
        "Write down the notice number printed in the upper right corner — it usually begins with CP or LTR followed by numbers. Then search for that number on the IRS website at irs.gov to read a plain language description of what the notice means. Check the response deadline carefully and note it on your calendar. Do not ignore the notice or throw it away. Do not call a tax resolution company you saw advertised on television without first understanding what the notice actually says — many of those services charge large fees for situations you could resolve yourself or with simple free assistance.",
    },
    {
      question: "What is the deadline to respond to an IRS notice?",
      answer:
        "Every IRS notice that requires a response will state a specific deadline, typically 30 to 60 days from the date on the letter. These deadlines matter because missing them can result in the IRS proceeding with their proposed changes automatically, which may mean additional taxes, penalties, or interest. If you need more time to gather documentation or seek help, you can call the number on the notice before the deadline and request an extension. The IRS generally grants extensions when asked in advance.",
    },
    {
      question: "Where can I get free help understanding an IRS notice?",
      answer:
        "Several free resources can help. The IRS Taxpayer Advocate Service assists people experiencing hardship or confusion dealing with the IRS. AARP Tax-Aide provides free tax help to people 50 and older, including help understanding IRS notices. Low Income Taxpayer Clinics offer free or low-cost representation for qualifying individuals. You can also upload your IRS notice to ReadMyPay.com to get a plain English explanation of what it says and what your options are before spending money on professional help you may not need.",
    },
  ],
  "dont-understand-document-without-bothering-anyone": [
    {
      question:
        "Is it normal to not understand your own financial documents?",
      answer:
        "Completely normal. Financial documents in the United States are designed for accounting systems and legal compliance, not for the people who receive them. They use abbreviations, codes, and formats that assume prior knowledge most people simply do not have. Not understanding a pay stub, W2, or tax form is not a sign of low intelligence or poor education. It is a normal response to documents that were never designed to be understood at a glance. Anyone who claims these documents are self-explanatory has simply forgotten what it was like to see them for the first time.",
    },
    {
      question:
        "How can elderly people safely get help understanding financial documents?",
      answer:
        "There are several safe options. AARP Tax-Aide offers free, in-person help from trained volunteers during tax season — no appointment needed at many locations. Public libraries frequently offer free digital literacy classes that cover financial document basics. VITA centers provide free tax preparation assistance for people who qualify based on income. For immediate help at any time of day, ReadMyPay.com allows you to upload a financial document and receive a plain English explanation privately, with nothing stored or saved. No one will call you, and no solicitation follows.",
    },
    {
      question:
        "What are the warning signs of financial scams targeting older adults?",
      answer:
        "Be wary of anyone who contacts you unexpectedly — by phone, email, or mail — offering to explain your financial documents or benefits on your behalf. Legitimate help services do not cold-call you. Be cautious of anyone who asks for your Social Security number, bank account information, or Medicare number in exchange for help. Watch out for requests to pay upfront fees before receiving any service. Genuine free resources like AARP, VITA, and libraries never ask for payment or sensitive account information. If something feels rushed or pressured, it is almost certainly a scam.",
    },
    {
      question:
        "I have a financial document I do not understand. What is the best first step?",
      answer:
        "The best first step is to identify what kind of document it is. Look for a title at the top — it may say W2, 1099, Explanation of Benefits, Medicare Summary Notice, or something similar. Once you know what type of document it is, you can search for it by name to find plain language explanations. If the document type is unclear or the explanation is still confusing after reading about it, you can upload it to ReadMyPay.com and receive a specific explanation of your exact document. Your file is never stored anywhere, and you do not need to create an account to try it.",
    },
    {
      question: "Is ReadMyPay.com free to use?",
      answer:
        "ReadMyPay.com offers one free document analysis per month with no account required. For additional documents, there is a pay-per-document option at $0.99 per upload, or a monthly subscription at $9.99 that allows up to 20 documents per month. There is no pressure to subscribe — the free option is available to anyone who wants to try it. Your document is never stored regardless of which option you use, and no one will contact you after your session.",
    },
  ],
};

/** FAQ pairs for a blog slug, or empty array if none (e.g. CMS-only post). */
export function getBlogFaqs(slug: string): FaqPair[] {
  return BLOG_FAQ_SCHEMA_BY_SLUG[slug] ?? [];
}
