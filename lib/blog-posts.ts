export type BlogPost = {
  slug: string;
  title: string;
  /** ISO date string */
  date: string;
  excerpt: string;
  content: string;
  /** Comma-separated SEO keywords (also used in article JSON-LD). */
  seoKeywords?: string | null;
  /** Optional meta description override (otherwise filled from lib/blog-static-seo). */
  seoDescription?: string | null;
};

/**
 * Static blog posts (edit here or move to CMS later).
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "pay-stub-every-line-explained",
    title:
      "Your Pay Stub Has a Lot of Numbers. Here's What Every Single One Means.",
    date: "2026-04-20",
    excerpt:
      "Gross pay, net pay, taxes, FICA, deductions, and YTD—what each line on your pay stub actually means and what to double-check.",
    seoKeywords:
      "pay stub explained, gross pay, net pay, federal income tax withholding, W-4, FICA, Social Security tax, Medicare tax, state income tax, local tax, payroll deductions, 401k, health insurance deduction, YTD year to date, payroll mistakes",
    content: `If you've worked a job in the last few decades, you've received hundreds of pay stubs. But if someone asked you right now to explain every line on one, could you? Most people can't — and that's not a personal failing. Pay stubs were designed for payroll departments, not for the people actually receiving them. They pack a lot of abbreviations, codes, and numbers into a small space and assume you already know what everything means. You don't have to just accept that confusion.

## Start with the two numbers that matter most

Every pay stub, no matter how complicated it looks, tells one central story: what you earned, and what you actually received. Your gross pay is what you earned before anything was taken out. Your net pay — sometimes printed at the bottom, sometimes labeled "amount deposited" — is what went into your bank account. Everything in between those two numbers is money that was taken out for one reason or another. Understanding where that difference goes is the entire purpose of reading a pay stub.

## Federal income tax withholding

This line shows how much was sent to the federal government toward your annual income tax. The word "withholding" just means your employer took it out before paying you. Think of it like paying your tax bill in small installments throughout the year rather than one large payment in April. How much gets withheld depends on a form you filled out when you were hired called a W-4. If you claimed more allowances, less gets withheld. If you claimed fewer, more gets withheld. Neither is wrong — it just affects whether you get a refund or owe money when you file your taxes.

## FICA — the two lines almost everyone ignores

FICA stands for Federal Insurance Contributions Act, which is a formal way of saying Social Security and Medicare. These two lines on your pay stub are contributions to programs you'll use later in life. Social Security currently takes 6.2% of your gross pay up to an annual limit. Medicare takes 1.45% with no cap. Unlike federal income tax, you cannot change these amounts. They are fixed by law for everyone.

## State and local taxes

Depending on where you live, you may see one or two more tax lines. State income tax varies widely — some states like Texas and Florida have none at all, while others like California and New York take a meaningful percentage. Local taxes are less common but do exist in certain cities and counties. If you've moved to a new state recently and the amount looks different from your old job, that's why.

## Deductions — the voluntary ones

Below the tax lines you'll often see deductions for things you chose to participate in. Health insurance is the most common — this is your share of the monthly premium for whatever health plan you enrolled in. Dental and vision may appear separately. A 401(k) or retirement plan contribution will show up here too if you're contributing to a workplace retirement account. These deductions are often taken out before your income is taxed, which actually reduces how much tax you owe — a small benefit worth knowing about.

## The YTD column

YTD stands for Year to Date. Most pay stubs show two columns: what was taken out this pay period, and the running total since January 1st. The YTD column is useful at tax time for double-checking that your W2 form matches your records, and for making sure your 401(k) contributions haven't accidentally exceeded the annual legal limit.

## What to actually check each time

You don't need to study your pay stub like a textbook every two weeks. But it's worth a 30-second scan to confirm that your gross pay matches what you expected to earn, that deductions for insurance or retirement are the amounts you signed up for, and that nothing new appeared on the deductions list without explanation. Mistakes do happen in payroll — and the only way to catch them is to look.

At tax time, your employer summarizes the year on a W-2—see our [W-2 form guide](/blog/what-is-w2-form-january) for every box explained.

If you've gone through this and your pay stub still has lines you can't identify, you're not alone. At ReadMyPay.com, you can upload your document and get a plain English explanation of every single line — privately, with nothing stored or saved. It's built for exactly this situation.`,
  },
  {
    slug: "what-is-w2-form-january",
    title: "What Is a W2 Form and Why Does It Show Up Every January?",
    date: "2026-04-19",
    excerpt:
      "A plain-English walkthrough of W-2 boxes: wages, withholding, Social Security, Medicare, Box 12 codes, and state lines.",
    seoKeywords:
      "W-2 form, W2 explained, Box 1 wages, Box 2 federal withholding, Box 3 Box 4 Social Security, Box 5 Box 6 Medicare, Box 12 codes, Form W-2 January, tax documents, employer",
    content: `Every January, something arrives in your mailbox or email inbox that a lot of people find stressful: a W2 form. It's a small document — usually just one page — but it carries a lot of weight because your entire tax return depends on it. If you've ever looked at a W2 and felt unsure what you were looking at, this guide will walk through every part of it in plain, honest language.

## What a W2 actually is

A W2 is a summary your employer sends you at the end of each year. It tells you — and the IRS — exactly how much you earned and how much was withheld in taxes throughout the year. Your employer is required by law to send it to you by January 31st. If you had more than one job during the year, you'll receive a separate W2 from each employer. You need all of them before you file your taxes.

## Box 1 — Wages, tips, other compensation

This is your total taxable income for the year from that employer. It sounds like it should match your gross pay from your last pay stub of the year, but it often doesn't — and that's normal. The reason is that certain deductions like 401(k) contributions and health insurance premiums paid through your employer are taken out before this number is calculated. So Box 1 is actually lower than your total gross earnings, which in most cases means you owe less in taxes.

## Box 2 — Federal income tax withheld

This is the total amount sent to the federal government on your behalf throughout the year. When you file your tax return, this number gets compared to what you actually owe. If Box 2 is more than what you owe, you get a refund. If it's less, you owe the difference. This is the box that determines the outcome of your tax filing more than almost any other.

## Boxes 3 and 4 — Social Security wages and tax withheld

Box 3 shows how much of your income was subject to Social Security tax. Box 4 shows how much was actually withheld — which should be exactly 6.2% of Box 3, up to the annual wage limit. If you earned above the Social Security wage base (which changes slightly each year), Box 3 will be capped even if Box 1 is higher.

## Boxes 5 and 6 — Medicare wages and tax withheld

Similar to Social Security, but Medicare has no wage cap. Box 5 is your total wages subject to Medicare tax, and Box 6 is the 1.45% that was withheld. If you earned more than $200,000, you may see an additional 0.9% Medicare surtax — that would also appear here.

## Box 12 — The box with letter codes

Box 12 confuses almost everyone because it uses letter codes instead of plain labels. Some common ones: Code D means 401(k) contributions. Code DD means the cost of employer-sponsored health coverage. Code W means contributions to a Health Savings Account. You don't usually need to do anything with these codes when filing — your tax software or preparer handles them — but it's helpful to know they're not errors.

## Boxes 15 through 17 — State tax information

These boxes show your state wages and how much state income tax was withheld. If you live in a state with no income tax, these may be blank. If you worked in multiple states during the year, you may see multiple rows.

## What to do when your W2 arrives

First, make sure the name, address, and Social Security number on the form are correct. An error there can cause problems with the IRS. Second, compare Box 1 to your final pay stub of the year — if they're significantly different and you don't know why, ask your HR department before filing. Third, keep all your W2s in one place until your taxes are done.

Freelance and other non-wage income usually arrives on a [1099](/blog/what-is-1099-form-guide) instead—here is how the common variants work.

If you'd like a plain English walkthrough of your actual W2 — every box, explained specifically for your document — you can upload it at ReadMyPay.com. Nothing is stored on our servers. Your document is read in your browser and never saved anywhere.`,
  },
  {
    slug: "is-it-safe-upload-financial-documents-online",
    title:
      '"Is It Safe to Upload My Financial Documents Online?" — An Honest Answer',
    date: "2026-04-18",
    excerpt:
      "Why storing uploads on servers is risky, what browser-only processing means, and how to evaluate any financial tool’s privacy claims.",
    seoKeywords:
      "upload financial documents safe, privacy financial documents, browser only processing, zero data retention, HTTPS, financial document security, AI privacy, Read My Pay",
    content: `This is the question we get more than any other. And it deserves a completely honest answer, not a marketing answer.

The concern is real and completely reasonable. Financial documents contain sensitive information — your name, address, employer, Social Security number in some cases, and a detailed picture of your income. Uploading something like that to a website is not a decision to take lightly. If you're hesitant, that hesitation shows good judgment, not technophobia.

## Why most websites storing your documents is a problem

Many online tools — not just financial ones — store everything you upload on their servers. They save files in databases, run analysis on them, sometimes use them to train AI systems, and hold onto them indefinitely. For a photo of your lunch, that's mildly annoying. For a document containing your income history and employer information, it's a legitimate risk. Data breaches happen. Companies get acquired. Privacy policies change. Once your data is on someone's server, you've lost control of it.

## What "browser-only processing" actually means

ReadMyPay.com was built around a specific technical approach: your document is processed entirely inside your own web browser, on your own device. It never travels to our servers. Think of it like this — when you open a PDF on your computer, the file doesn't go anywhere. It opens right there. ReadMyPay works the same way. The document stays with you. The analysis happens on your device. When you close the tab, it's gone. There is nothing on our end to breach, sell, or lose.

## What about the AI reading the document?

This is the more technical part. ReadMyPay uses an AI service to understand and explain your document. When that happens, the content of the document is sent to the AI service — but under a strict zero data retention policy. That means the AI processes your document to generate an explanation and then immediately discards it. It is not stored, logged, or used for training. This is a specific contractual arrangement, not just a promise on a webpage.

## How to evaluate any online tool for privacy

Regardless of whether you use ReadMyPay or any other service, here are the questions worth asking. Does the site use HTTPS (look for the padlock icon in your browser's address bar)? Does the privacy policy explicitly say your data is not stored or sold? Is there a clear explanation of how the document processing works? Is the company transparent about what AI service they use and under what terms? A site that can't answer these questions clearly is one to avoid.

## The honest bottom line

No digital tool is completely without risk — that's true of online banking, email, and anything else. But the risk level varies enormously based on how a service is built. ReadMyPay was designed specifically to minimize that risk for people who are cautious about their financial information. If you're still not comfortable, that's a completely valid choice. The right decision is the one you can make confidently.`,
  },
  {
    slug: "what-is-1099-form-guide",
    title:
      "What Is a 1099 Form? A Guide for Freelancers, Retirees, and Anyone Who Gets One",
    date: "2026-04-17",
    excerpt:
      "1099-NEC, 1099-SSA, 1099-R, 1099-INT, 1099-DIV—what each common 1099 means and why the IRS already knows about that income.",
    seoKeywords:
      "1099 form, 1099-NEC freelance, 1099-SSA Social Security, 1099-R retirement, 1099-INT interest, 1099-DIV dividends, self-employment tax, IRS reporting",
    content: `If you've ever done freelance work, received Social Security benefits, earned interest from a bank account, or taken money out of a retirement account, you've probably received a 1099. Many people find these forms more confusing than a W2 because there are so many different types. This guide explains the most common ones in plain language.

## The basic idea behind a 1099

A 1099 is an income reporting form — but unlike a W2, it reports income where no taxes were withheld. When an employer pays you a salary, they withhold taxes before you receive the money. When a client pays you for freelance work, or a bank pays you interest, they give you the full amount and report it to the IRS. You're then responsible for paying tax on it yourself when you file. The 1099 is simply the document that tells both you and the IRS that this income exists.

## 1099-NEC — freelance and contract income

NEC stands for Nonemployee Compensation. If you did any independent contractor work, consulting, or freelance services and were paid $600 or more by a single client, they are required to send you this form. It shows the total amount paid to you during the year. You'll report this income on your tax return, and because no taxes were withheld, you may owe self-employment tax on top of regular income tax.

## 1099-SSA — Social Security benefits

If you receive Social Security retirement or disability benefits, you'll get this form every January. It shows how much you received during the year. Depending on your total income from all sources, a portion of your Social Security benefits may be taxable. This surprises many retirees. Your tax preparer or software will calculate whether any of it is taxable based on your complete financial picture.

## 1099-R — retirement account distributions

If you took money out of a pension, 401(k), IRA, or annuity during the year, you'll receive a 1099-R. Box 1 shows the gross distribution — how much you withdrew. Box 2a shows the taxable amount. Box 4 shows any federal tax withheld. Most retirement account withdrawals are fully taxable, though Roth IRA distributions often are not. Box 7 contains a distribution code that tells the IRS what kind of withdrawal it was — your tax software will know what to do with it.

## 1099-INT — interest income

Banks, credit unions, and other financial institutions send this form if they paid you $10 or more in interest during the year. It's a straightforward form — Box 1 shows taxable interest, Box 3 shows any interest that's exempt from state taxes. If you have multiple accounts at different banks, you may receive several of these.

## 1099-DIV — dividend income

If you own stocks or mutual funds that paid dividends, you'll receive this form from your brokerage. Box 1a shows total ordinary dividends. Box 1b shows qualified dividends, which are taxed at a lower rate. Box 2a shows capital gain distributions. You don't need to do anything with these numbers yourself — just enter them into your tax return where indicated.

## What to do when a 1099 arrives

Every 1099 you receive represents income the IRS already knows about — the company or institution that sent it to you also sent a copy directly to the IRS. This means that if you don't report it on your tax return, there will be a mismatch that can trigger a notice or audit. Keep every 1099 you receive and make sure your tax return accounts for all of them.

If you've received a 1099 you don't fully understand, you can upload it to ReadMyPay.com for a plain English explanation of every box and what it means for your taxes. Your document is never stored.`,
  },
  {
    slug: "bank-statement-lines-explained",
    title:
      "Understanding Your Bank Statement: What All Those Lines Actually Mean",
    date: "2026-04-16",
    excerpt:
      "Statement period, deposits, withdrawals, ACH, fees, pending vs posted—and how statements help you spot errors and spending patterns.",
    seoKeywords:
      "bank statement explained, ACH meaning, direct deposit, pending vs posted, bank fees, overdraft, transaction list, spending categories",
    content: `A bank statement is one of the most information-dense documents most people receive every month, and one of the least read. Most of us glance at the ending balance, maybe scan for anything that looks wrong, and move on. But a bank statement contains a complete record of your financial life for that period — and understanding it fully can help you catch errors, spot forgotten subscriptions, and see your actual spending patterns clearly.

## The basic structure of a bank statement

Most bank statements follow the same general layout. At the top, you'll find the statement period (the dates it covers), your account number (usually partially masked for security), and your beginning and ending balance. Below that is a transaction list — every deposit, withdrawal, purchase, and fee that occurred during the period. At the bottom or in a summary section, you'll often find a breakdown of totals: total deposits, total withdrawals, and sometimes a category summary.

## Deposits

Deposits are money coming into your account. Direct deposit from an employer will usually appear with your employer's name or a payroll processing code. Social Security and pension deposits often appear as ACH credits with a government reference. Transfers from your own other accounts will show as transfers. Any cash deposited at a branch or ATM will appear as a cash deposit.

## Withdrawals and purchases

These are money leaving your account. Debit card purchases will show the merchant name, sometimes abbreviated. ATM withdrawals will show the ATM location. Bill payments made through your bank's bill pay system will show the payee name. Automatic payments — subscriptions, insurance, utilities — will usually show a company name and sometimes the word "ACH" which simply means the payment was processed electronically.

## What ACH means

ACH stands for Automated Clearing House. It's the electronic network that processes direct deposits, bill payments, and automatic transfers in the United States. When you see ACH on your bank statement, it means the transaction was processed electronically rather than by check or card. It's not a company name or a type of fee — it's just a description of how the payment moved.

## Fees

Banks charge various fees that will appear on your statement. Monthly maintenance fees are charged just for having the account if you don't meet minimum balance requirements. Overdraft fees appear when a transaction exceeds your available balance. ATM fees occur when you use an ATM outside your bank's network. Wire transfer fees appear when you send money by wire. If you see a fee you don't recognize or didn't expect, your bank is required to explain it if you ask.

## Pending vs. posted transactions

Some statements distinguish between pending and posted transactions. A pending transaction is one that has been authorized but not fully processed — the money is held but hasn't officially left your account yet. A posted transaction is complete. The ending balance on your statement reflects only posted transactions, which is why your available balance in your bank's app may differ from your statement balance.

## How to use your bank statement to understand your spending

If you upload three or more months of bank statements to ReadMyPay.com, the tool will categorize every transaction and show you a visual breakdown of your spending by category — groceries, dining, utilities, subscriptions, medical expenses, and so on. Many people find categories they had forgotten about, subscriptions they no longer use, or spending patterns that surprise them. It's the same kind of analysis a financial advisor would do, available in a few minutes, with nothing saved or stored.`,
  },
  {
    slug: "social-security-statement-earnings-record",
    title:
      "Social Security Statements Explained: What Your Earnings Record Really Tells You",
    date: "2026-04-15",
    excerpt:
      "Earnings history, benefit estimates, full retirement age, claiming at 62 vs 70, disability and survivor benefits—and why fixing errors early matters.",
    seoKeywords:
      "Social Security statement, earnings record, PIA, full retirement age, claim at 62, delay to 70, SSA.gov, retirement benefits, disability benefits",
    content: `The Social Security statement is one of the most important financial documents most Americans receive — and one of the least understood. It's sent to workers periodically and is available anytime through the Social Security Administration's website. If you've never read yours carefully, this guide will walk through what it contains and why it matters.

## What the statement is and where to get it

Your Social Security statement is an official record maintained by the Social Security Administration that tracks your earnings history and estimates your future benefits. You can access it at any time by creating an account at ssa.gov. Paper statements are also mailed to workers who are 60 or older and not yet receiving benefits. This document is worth reading carefully because it directly affects how much you'll receive in retirement.

## Your earnings record

The most important section of the statement is your year-by-year earnings history going back to your very first year of work. This record is what the Social Security Administration uses to calculate your benefit. Each year, your employer reports your wages to the SSA. That reported amount is what appears here. You should review this list carefully, because errors do occur. If a year shows zero earnings when you know you worked, or a lower number than you believe you earned, you can correct it — but documentation like old W2s or tax returns helps. Errors are easier to correct sooner rather than later.

## How your benefit is calculated

Social Security retirement benefits are based on your highest 35 years of earnings, adjusted for inflation. If you worked fewer than 35 years, the missing years count as zero in the calculation, which lowers your average. The calculation produces a number called your Primary Insurance Amount, or PIA — the monthly benefit you'd receive if you claim at your full retirement age.

## Full retirement age

Your full retirement age — the age at which you receive 100% of your calculated benefit — depends on when you were born. For people born between 1943 and 1954, it's 66. For those born after 1960, it's 67. For birth years in between, it's somewhere in the middle. Your statement will tell you your specific full retirement age.

## Claiming early vs. late

You can claim Social Security as early as age 62, but your monthly benefit will be permanently reduced — by up to 30% if you're many years before full retirement age. Conversely, if you delay claiming past your full retirement age up to age 70, your benefit increases by about 8% per year. This is a significant difference over a long retirement and is one of the most important financial decisions most retirees face. Your statement shows estimated benefit amounts at 62, at full retirement age, and at 70.

## Disability and survivor benefits

The statement also shows your estimated disability benefit — what you'd receive if you became unable to work due to a disability before retirement. And it shows survivor benefits — what your spouse or dependents would receive if you died. These numbers are worth knowing even if you hope never to need them.

## What to do with this information

Review your earnings record every few years while you're still working. Make sure the numbers are accurate. If you're within 10 years of retirement, consider running through different claiming age scenarios — the difference between claiming at 62 versus 70 can be hundreds of dollars per month for the rest of your life.

If you have your Social Security statement and want a plain English walkthrough of what it means for your specific situation, you can upload it at ReadMyPay.com for a clear explanation of every section.`,
  },
  {
    slug: "medicare-eob-explanation-of-benefits",
    title:
      "Medicare Explanation of Benefits: Why You Got That Letter and What to Do With It",
    date: "2026-04-14",
    excerpt:
      "Why an EOB isn’t a bill, how to read a Medicare Summary Notice, deductibles, coinsurance, and how to spot billing errors.",
    seoKeywords:
      "Medicare EOB, Explanation of Benefits, Medicare Summary Notice, Part B deductible, coinsurance, Medigap, Medicare Advantage, medical billing",
    content: `If you're on Medicare, you periodically receive a document called an Explanation of Benefits, or EOB. Many Medicare recipients find these letters confusing — and some mistake them for a bill, which they are not. This guide explains what an EOB actually is, how to read it, and when to take action.

## An EOB is not a bill

This is the single most important thing to understand. The Explanation of Benefits is a summary of medical claims that were submitted to Medicare on your behalf. It shows what was billed, what Medicare approved, what Medicare paid, and what — if anything — you may owe. But the EOB itself is not a request for payment. If you owe anything, a separate bill will come from your doctor or provider.

## Original Medicare sends a Medicare Summary Notice

If you have Original Medicare (Part A and Part B), your EOB is called a Medicare Summary Notice, or MSN. It arrives quarterly and covers all the claims submitted during that period. If you have Medicare Advantage (Part C) through a private insurance company, your EOB comes from that insurance company and may look different, but contains the same basic information.

## How to read the Medicare Summary Notice

The MSN lists each claim by date of service and provider. For each claim it shows the amount billed by the provider, the Medicare-approved amount (which is almost always lower — Medicare negotiates rates with providers), the amount Medicare paid, and the amount you may be responsible for. The "you may be responsible for" column is the important one if you're trying to understand whether a bill you received is legitimate.

## Your deductible and coinsurance

Medicare Part B has an annual deductible — once you've met it for the year, Medicare starts covering its 80% share of approved costs. Your 20% share is called coinsurance. This is why you receive bills from doctors even when Medicare is active — they're billing you for your 20%. If you have a Medigap supplement policy, it may cover some or all of that 20%.

## How to spot errors on your EOB

Medical billing errors are surprisingly common. When you receive an MSN or EOB, compare the dates and services listed against your own records. Did you actually see that provider on that date? Does the service listed match what was done? If something appears that you don't recognize — a service you didn't receive, a provider you never saw — it could be a billing error or, in rare cases, fraud. You can report discrepancies to Medicare at 1-800-MEDICARE.

## The "appeals" section

Every EOB includes information about your right to appeal if Medicare denied a claim or paid less than you believe it should. Appeals have deadlines, so don't set the document aside if you believe a claim was incorrectly handled.

If you receive a Medicare document that you can't fully understand, you can upload it to ReadMyPay.com and get a plain English explanation of what it's saying and what, if anything, you need to do. Nothing is stored or saved.`,
  },
  {
    slug: "pension-statement-retirement-benefit",
    title: "Pension Statements Explained: What Your Retirement Benefit Actually Means",
    date: "2026-04-13",
    excerpt:
      "Defined benefit vs 401(k), accrued benefit, typical formulas, early retirement, survivor options, and vesting—in plain English.",
    seoKeywords:
      "pension statement, defined benefit plan, accrued benefit, pension formula, normal retirement age, joint and survivor annuity, vesting, retirement planning",
    content: `If you worked for an employer that offered a traditional pension — common in government jobs, education, manufacturing, and many union positions — you likely receive periodic pension statements. These documents contain important information about your future retirement income, and understanding them clearly can make a significant difference in your retirement planning.

## The difference between a pension and a 401(k)

Before getting into the statement itself, it's worth clarifying what a pension is. A pension — formally called a defined benefit plan — promises you a specific monthly income in retirement based on your years of service and salary history. The employer manages the investment and bears the risk. A 401(k) is a defined contribution plan — you contribute money, it grows based on market performance, and the final amount depends on investment returns. If you have a pension, your retirement income is more predictable than a 401(k), but you need to understand the formula to know what to expect.

## Your accrued benefit

Pension statements typically show your accrued benefit — the monthly income you've earned so far based on your current years of service and salary. This is the amount you'd receive starting at your normal retirement age if you stopped working today. It's not your final pension amount if you continue working — that grows each year you continue to contribute.

## The benefit formula

Most pensions use a formula something like: years of service × a multiplier × your average salary over a specified period. A common formula might be 1.5% × years of service × average of your highest 3 years of salary. So someone with 25 years of service and a high-3 average of $50,000 would receive $18,750 per year, or $1,562.50 per month. Your statement should show the specific formula your plan uses.

## Normal retirement age and early retirement options

Your statement will show your normal retirement age — the age at which you receive your full calculated benefit. Most pensions also offer early retirement options, but with a reduction in the monthly amount. The reduction is typically permanent. Some plans offer early retirement with no reduction if you've reached a specific combination of age and years of service — sometimes called the "rule of 80" or similar.

## Survivor benefit options

One of the most important decisions you'll make at retirement is whether to take a single-life annuity or a joint-and-survivor annuity. A single-life annuity pays the highest monthly amount but stops when you die. A joint-and-survivor annuity pays a lower monthly amount but continues paying a percentage to your spouse after your death. This decision is irreversible once made, so it deserves careful consideration.

## Vesting

You may see the word "vested" on your statement. Vesting refers to the point at which you've worked long enough to have a legal right to the pension benefit, even if you leave the employer. Some plans vest immediately. Others have a graded vesting schedule over several years. If you're not yet fully vested, your statement will usually show when you will be.

If you've received a pension statement and want a clear explanation of what your specific numbers mean, ReadMyPay.com can walk you through it in plain language. Upload your document privately — nothing is saved.`,
  },
  {
    slug: "what-is-irs-notice-tax-letter",
    title:
      "What Is an IRS Notice? Understanding Letters From the Tax Agency Without Panic",
    date: "2026-04-12",
    excerpt:
      "Notice numbers, CP2000 vs CP14, deadlines, what not to do, and where to get help before paying for tax resolution you may not need.",
    seoKeywords:
      "IRS notice explained, CP2000, CP14, CP501, IRS letter, tax deficiency, respond to IRS, Taxpayer Advocate, IRS audit letter",
    content: `Receiving a letter from the IRS is one of the things that causes people the most anxiety — often out of proportion to what the letter actually says. The vast majority of IRS notices are routine, informational, or simple requests that require a straightforward response. Understanding what you're looking at is the first step to handling it calmly.

## Not all IRS letters mean you're in trouble

The IRS sends millions of letters every year for reasons that have nothing to do with audits or penalties. Some letters simply confirm that you filed your return. Others notify you of a change to your refund amount. Some ask you to verify your identity. Others request documentation to support a specific item on your return. The letter itself will tell you exactly why it was sent and what, if anything, you need to do.

## Find the notice number

Every IRS notice has a notice or letter number printed in the upper right corner, usually starting with "CP" or "LTR" followed by a number. This number identifies exactly what the notice is about. If you search the IRS website (irs.gov) for your notice number, you'll find a plain language explanation of what it means and what the IRS expects from you. Writing down this number before doing anything else is the first step.

## Common notice types

CP2000 is one of the most common — it means the IRS found income on a 1099 or W2 that doesn't appear to match what you reported on your return. It's not an automatic finding that you owe money; it's a request to confirm or correct the information. CP14 means you have a balance due. CP501 is a reminder that you owe a balance. CP503 is a second reminder. LTR 525 may indicate an audit of specific items. LTR 3219 is a statutory notice of deficiency, which is more serious and has a specific response deadline.

## Response deadlines matter

Every IRS notice that requires a response will include a deadline. These deadlines are important. If you don't respond by the deadline, the IRS may assume you agree with their position and proceed accordingly. If you need more time, you can call the number on the notice and request an extension before the deadline passes.

## What not to do

Do not ignore an IRS notice. Do not throw it away. Do not assume it's junk mail. And do not immediately call a tax resolution company advertising on television — many of these charge large fees for services you may not need. If the notice is routine, you may be able to handle it yourself or with the help of the IRS's free taxpayer assistance resources.

## Getting help

If you receive an IRS notice that you don't understand, you have several options. The IRS has a Taxpayer Advocate Service for people experiencing hardship. AARP Tax-Aide offers free tax help to people 50 and older. And you can upload an IRS notice to ReadMyPay.com to get a plain English explanation of what it says and what your options are — before spending money on professional help you may not need.`,
  },
  {
    slug: "dont-understand-document-without-bothering-anyone",
    title:
      '"I Don\'t Understand This Document and I Don\'t Want to Bother Anyone" — This Is for You',
    date: "2026-04-11",
    excerpt:
      "Financial paperwork is confusing by design; how to ask for help safely; what a legitimate tool looks like—and why you deserve to understand your own documents.",
    seoKeywords:
      "understand financial documents, embarrassed to ask, financial literacy, document help, privacy safe help, financial scams older adults, Read My Pay",
    content: `This last post is a little different. It's not a technical explanation of a specific document. It's written for a specific person — someone who has a financial document sitting on their kitchen table or in an envelope they haven't opened yet, because they're not sure what it means and they feel embarrassed to ask.

If that's you, please keep reading.

## The embarrassment is completely undeserved

Financial documents in America are genuinely confusing. They use technical language, abbreviations, and formats designed for accounting systems rather than human beings. The people who understand them easily are either finance professionals or people who've spent years learning through trial and error. Not understanding a pay stub or a tax form at first glance is not a sign of low intelligence or poor education. It's a normal response to documents that were never designed to be understood by the people receiving them.

## The fear of asking for help is real — and also understandable

Many people, especially older adults, worry that asking about a financial document will expose them to judgment, or worse, to exploitation. There are unfortunately people who take advantage of financial confusion. That's real. But it doesn't mean every source of help is dangerous. It means being careful about who you ask and how you ask.

## What to be cautious about

Be wary of anyone who offers to "handle" your financial documents on your behalf without clear explanation of what they're doing. Be wary of services that require you to hand over account numbers or Social Security numbers to get help. Be wary of unsolicited phone calls offering to explain your benefits or tax documents — this is a common vector for scams targeting older adults. And be wary of services that keep copies of your documents without a clear explanation of why and for how long.

## What a legitimate help tool looks like

A legitimate tool or service for understanding financial documents will explain clearly how it works. It will not require more personal information than necessary. It will not keep your documents. It will not try to sell you additional services aggressively. And it will give you honest, complete information rather than vague reassurances.

ReadMyPay.com was built with this person in mind — the person who has a document they don't understand and doesn't know who to ask. Upload your document and receive a plain English explanation of every line. The document is processed privately in your browser and never stored anywhere. There is no account required for basic use. No one will call you. No one will solicit you. You get an explanation, and then you make your own decisions with clear information.

## You deserve to understand your own financial documents

That's the simple belief behind this site. You worked for that paycheck. You paid those taxes. You earned those benefits. The paperwork that comes with those things should not be a mystery to you. If it has been until now — that's not your fault, and it doesn't have to continue.

Whatever document is sitting on your table, you can understand it. Start there.`,
  },
];
