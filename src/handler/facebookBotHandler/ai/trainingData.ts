/**
 * Training data for the Facebook Bot AI Intent Classifier
 * Supports both Bengali (বাংলা) and English messages
 */

export type Intent =
    | "FIND_BLOOD"
    | "REGISTER_DONOR"
    | "UPDATE_DONATION"
    | "REQUEST_BLOOD"
    | "BLOOD_INFO"
    | "GREET"
    | "HELP"
    | "UNKNOWN";

export interface TrainingSample {
    text: string;
    intent: Intent;
}

export const trainingData: TrainingSample[] = [
    // ─── FIND_BLOOD ───────────────────────────────────────────────────
    // English
    { text: "I need blood", intent: "FIND_BLOOD" },
    { text: "need blood urgently", intent: "FIND_BLOOD" },
    { text: "find blood donor", intent: "FIND_BLOOD" },
    { text: "find a donor", intent: "FIND_BLOOD" },
    { text: "looking for blood donor", intent: "FIND_BLOOD" },
    { text: "search blood donor", intent: "FIND_BLOOD" },
    { text: "need A positive blood", intent: "FIND_BLOOD" },
    { text: "need B negative blood", intent: "FIND_BLOOD" },
    { text: "need O positive blood", intent: "FIND_BLOOD" },
    { text: "need AB positive blood", intent: "FIND_BLOOD" },
    { text: "blood needed", intent: "FIND_BLOOD" },
    { text: "blood required", intent: "FIND_BLOOD" },
    { text: "blood emergency", intent: "FIND_BLOOD" },
    { text: "urgent blood needed", intent: "FIND_BLOOD" },
    { text: "donor needed", intent: "FIND_BLOOD" },
    { text: "blood donor near me", intent: "FIND_BLOOD" },
    { text: "where can I find blood donor", intent: "FIND_BLOOD" },
    { text: "patient needs blood", intent: "FIND_BLOOD" },
    { text: "hospital needs blood", intent: "FIND_BLOOD" },
    { text: "A+ blood needed", intent: "FIND_BLOOD" },
    { text: "B+ donor near dhaka", intent: "FIND_BLOOD" },
    { text: "O- blood required urgently", intent: "FIND_BLOOD" },
    { text: "AB+ blood", intent: "FIND_BLOOD" },
    { text: "need donor in chittagong", intent: "FIND_BLOOD" },
    { text: "find blood in sylhet", intent: "FIND_BLOOD" },
    { text: "blood donor dhaka", intent: "FIND_BLOOD" },
    { text: "can someone donate blood", intent: "FIND_BLOOD" },
    { text: "2 bags of A+ blood needed tomorrow", intent: "FIND_BLOOD" },
    { text: "need 2 units of blood in hospital", intent: "FIND_BLOOD" },
    { text: "donor list in rangpur city", intent: "FIND_BLOOD" },
    { text: "give me a list of B+ donors", intent: "FIND_BLOOD" },
    { text: "need O- blood at Dhaka Medical", intent: "FIND_BLOOD" },
    { text: "rare blood group AB negative needed", intent: "FIND_BLOOD" },
    { text: "where to find rare blood group", intent: "FIND_BLOOD" },
    // Bengali – সরাসরি অনুরোধ
    { text: "রক্ত দরকার", intent: "FIND_BLOOD" },
    { text: "রক্ত চাই", intent: "FIND_BLOOD" },
    { text: "রক্তদাতা দরকার", intent: "FIND_BLOOD" },
    { text: "রক্তদাতা খুঁজছি", intent: "FIND_BLOOD" },
    { text: "কাছাকাছি রক্তদাতা খুঁজুন", intent: "FIND_BLOOD" },
    { text: "এ পজিটিভ রক্ত চাই", intent: "FIND_BLOOD" },
    { text: "বি পজিটিভ রক্ত দরকার", intent: "FIND_BLOOD" },
    { text: "ও পজিটিভ রক্ত চাই", intent: "FIND_BLOOD" },
    { text: "এবি পজিটিভ রক্ত দরকার", intent: "FIND_BLOOD" },
    { text: "জরুরি রক্ত দরকার", intent: "FIND_BLOOD" },
    { text: "রক্ত খুঁজছি", intent: "FIND_BLOOD" },
    { text: "আমার রক্ত দরকার", intent: "FIND_BLOOD" },
    { text: "রোগীর রক্ত লাগবে", intent: "FIND_BLOOD" },
    { text: "হাসপাতালে রক্ত লাগবে", intent: "FIND_BLOOD" },
    { text: "A+ রক্ত দরকার", intent: "FIND_BLOOD" },
    { text: "B+ রক্ত চাই", intent: "FIND_BLOOD" },
    { text: "O- রক্ত জরুরি", intent: "FIND_BLOOD" },
    { text: "AB+ রক্ত লাগবে", intent: "FIND_BLOOD" },
    { text: "ঢাকায় রক্তদাতা দরকার", intent: "FIND_BLOOD" },
    { text: "চট্টগ্রামে রক্ত চাই", intent: "FIND_BLOOD" },
    { text: "সিলেটে রক্তদাতা খুঁজছি", intent: "FIND_BLOOD" },
    { text: "রক্তদান করতে যোগাযোগ করুন", intent: "FIND_BLOOD" },
    { text: "রক্ত দেবে কে", intent: "FIND_BLOOD" },
    { text: "রক্তের প্রয়োজন", intent: "FIND_BLOOD" },
    { text: "ডোনার খুঁজছি", intent: "FIND_BLOOD" },
    { text: "ডোনার দরকার", intent: "FIND_BLOOD" },
    // Bengali – হাসপাতাল / ব্যাগ / জটিল অনুরোধ
    { text: "জরুরি O+ রক্ত প্রয়োজন ঢাকা মেডিকেল কলেজের আশেপাশে ডোনার আছে", intent: "FIND_BLOOD" },
    { text: "চট্টগ্রাম মা ও শিশু হাসপাতালে ২ ব্যাগ A- রক্ত লাগবে", intent: "FIND_BLOOD" },
    { text: "রংপুর সিটি এরিয়ায় B+ ডোনারদের লিস্ট দাও", intent: "FIND_BLOOD" },
    { text: "ঢাকা মেডিকেলে O পজিটিভ রক্ত লাগবে কাল সকালে", intent: "FIND_BLOOD" },
    { text: "২ ব্যাগ রক্ত দরকার", intent: "FIND_BLOOD" },
    { text: "রেয়ার ব্লাড গ্রুপ AB- কোথায় পাওয়া যাবে", intent: "FIND_BLOOD" },
    { text: "বিরল রক্তের গ্রুপ কোথায় পাবো", intent: "FIND_BLOOD" },
    { text: "AB নেগেটিভ রক্ত জরুরি", intent: "FIND_BLOOD" },
    { text: "থ্যালাসেমিয়া রোগীর জন্য নিয়মিত রক্ত লাগবে", intent: "FIND_BLOOD" },
    { text: "ডোনারদের একটা লিস্ট দিন", intent: "FIND_BLOOD" },
    { text: "কাছের ডোনার কারা আছে", intent: "FIND_BLOOD" },

    // ─── REGISTER_DONOR ──────────────────────────────────────────────
    // English
    { text: "I want to donate blood", intent: "REGISTER_DONOR" },
    { text: "register as donor", intent: "REGISTER_DONOR" },
    { text: "become a blood donor", intent: "REGISTER_DONOR" },
    { text: "sign up as donor", intent: "REGISTER_DONOR" },
    { text: "I want to register", intent: "REGISTER_DONOR" },
    { text: "add me as donor", intent: "REGISTER_DONOR" },
    { text: "I can donate blood", intent: "REGISTER_DONOR" },
    { text: "how to register as donor", intent: "REGISTER_DONOR" },
    { text: "register", intent: "REGISTER_DONOR" },
    { text: "want to be donor", intent: "REGISTER_DONOR" },
    // Bengali
    { text: "আমি রক্ত দিতে চাই", intent: "REGISTER_DONOR" },
    { text: "রক্তদাতা হিসেবে নিবন্ধন করতে চাই", intent: "REGISTER_DONOR" },
    { text: "নিবন্ধন করতে চাই", intent: "REGISTER_DONOR" },
    { text: "ডোনার হতে চাই", intent: "REGISTER_DONOR" },
    { text: "রক্তদান করতে চাই", intent: "REGISTER_DONOR" },
    { text: "আমাকে ডোনার হিসেবে যোগ করুন", intent: "REGISTER_DONOR" },
    { text: "রেজিস্ট্রেশন করতে চাই", intent: "REGISTER_DONOR" },
    { text: "আমি রক্ত দিতে পারব", intent: "REGISTER_DONOR" },
    { text: "রেজিস্টার", intent: "REGISTER_DONOR" },
    { text: "ডোনার তালিকায় যোগ দিতে চাই", intent: "REGISTER_DONOR" },
    { text: "ডোনার হিসেবে নাম লেখাতে চাই কী করতে হবে", intent: "REGISTER_DONOR" },
    { text: "আমার প্রোফাইল অ্যাভেইলেবল না করো", intent: "REGISTER_DONOR" },
    { text: "আমি এখন অসুস্থ প্রোফাইল বন্ধ করো", intent: "REGISTER_DONOR" },
    { text: "profile unavailable mark", intent: "REGISTER_DONOR" },

    // ─── UPDATE_DONATION ─────────────────────────────────────────────
    // English
    { text: "I donated blood today", intent: "UPDATE_DONATION" },
    { text: "update last donation", intent: "UPDATE_DONATION" },
    { text: "I gave blood", intent: "UPDATE_DONATION" },
    { text: "update my donation date", intent: "UPDATE_DONATION" },
    { text: "just donated blood", intent: "UPDATE_DONATION" },
    { text: "blood donation done", intent: "UPDATE_DONATION" },
    { text: "update donation record", intent: "UPDATE_DONATION" },
    { text: "update phone number and last donation", intent: "UPDATE_DONATION" },
    // Bengali
    { text: "আমি রক্ত দিয়েছি", intent: "UPDATE_DONATION" },
    { text: "রক্তদানের তারিখ আপডেট করুন", intent: "UPDATE_DONATION" },
    { text: "শেষ রক্তদান আপডেট", intent: "UPDATE_DONATION" },
    { text: "আজ রক্ত দিয়েছি", intent: "UPDATE_DONATION" },
    { text: "গতকাল রক্ত দিয়েছি", intent: "UPDATE_DONATION" },
    { text: "আপডেট করুন", intent: "UPDATE_DONATION" },
    { text: "আমার ফোন নাম্বার এবং লাস্ট ব্লাড ডোনেশনের তারিখ আপডেট করো", intent: "UPDATE_DONATION" },
    { text: "লাস্ট ডোনেশন ডেট চেঞ্জ করো", intent: "UPDATE_DONATION" },

    // ─── REQUEST_BLOOD ───────────────────────────────────────────────
    { text: "request for blood", intent: "REQUEST_BLOOD" },
    { text: "submit blood request", intent: "REQUEST_BLOOD" },
    { text: "post blood request", intent: "REQUEST_BLOOD" },
    { text: "blood request form", intent: "REQUEST_BLOOD" },
    { text: "রক্তের জন্য আবেদন", intent: "REQUEST_BLOOD" },
    { text: "রক্ত আবেদন করতে চাই", intent: "REQUEST_BLOOD" },
    { text: "রিকোয়েস্ট করতে চাই", intent: "REQUEST_BLOOD" },

    // ─── BLOOD_INFO ──────────────────────────────────────────────────
    // বয়স / ওজন / যোগ্যতা
    { text: "রক্ত দেওয়ার জন্য ন্যূনতম বয়স কত", intent: "BLOOD_INFO" },
    { text: "রক্তদানে ন্যূনতম ওজন কত হওয়া উচিত", intent: "BLOOD_INFO" },
    { text: "রক্ত দিতে হলে বয়স কত লাগবে", intent: "BLOOD_INFO" },
    { text: "ব্লাড ডোনেশনের জন্য বয়স ওজন কত", intent: "BLOOD_INFO" },
    { text: "minimum age to donate blood", intent: "BLOOD_INFO" },
    { text: "minimum weight to donate blood", intent: "BLOOD_INFO" },
    { text: "eligibility for blood donation", intent: "BLOOD_INFO" },
    { text: "who can donate blood", intent: "BLOOD_INFO" },
    // পুনরায় দান
    { text: "৩ মাস আগে রক্ত দিয়েছি আবার কি দিতে পারব", intent: "BLOOD_INFO" },
    { text: "কতদিন পর পর রক্ত দেওয়া যায়", intent: "BLOOD_INFO" },
    { text: "আবার কখন রক্ত দিতে পারব", intent: "BLOOD_INFO" },
    { text: "how often can I donate blood", intent: "BLOOD_INFO" },
    { text: "when can I donate again", intent: "BLOOD_INFO" },
    { text: "gap between blood donations", intent: "BLOOD_INFO" },
    // ট্যাটু
    { text: "ট্যাটু করানোর পর রক্ত দেওয়া যায়", intent: "BLOOD_INFO" },
    { text: "ট্যাটু করালে কতদিন পর রক্ত দেওয়া যায়", intent: "BLOOD_INFO" },
    { text: "tattoo করার পর রক্ত দান", intent: "BLOOD_INFO" },
    { text: "can I donate blood after tattoo", intent: "BLOOD_INFO" },
    { text: "tattoo blood donation waiting period", intent: "BLOOD_INFO" },
    // রক্তদানের পরে
    { text: "রক্ত দেওয়ার পর কী খাবো", intent: "BLOOD_INFO" },
    { text: "রক্তদানের পর কোন খাবার ভালো", intent: "BLOOD_INFO" },
    { text: "ব্লাড দেওয়ার পর কী করব", intent: "BLOOD_INFO" },
    { text: "what to eat after donating blood", intent: "BLOOD_INFO" },
    { text: "after blood donation food", intent: "BLOOD_INFO" },
    { text: "post donation care", intent: "BLOOD_INFO" },
    // থ্যালাসেমিয়া / রিমাইন্ডার
    { text: "থ্যালাসেমিয়া রোগীর জন্য রিমাইন্ডার সিস্টেম আছে", intent: "BLOOD_INFO" },
    { text: "অটোমেটিক রিমাইন্ডার কি আছে", intent: "BLOOD_INFO" },
    { text: "thalassemia reminder system", intent: "BLOOD_INFO" },
    { text: "automatic reminder blood donation", intent: "BLOOD_INFO" },
    // রক্তদানের উপকারিতা
    { text: "রক্ত দিলে কি উপকার হয়", intent: "BLOOD_INFO" },
    { text: "blood donation benefits", intent: "BLOOD_INFO" },
    { text: "রক্তদানের সুবিধা কি", intent: "BLOOD_INFO" },
    { text: "is blood donation safe", intent: "BLOOD_INFO" },
    { text: "রক্ত দিলে কি ক্ষতি হয়", intent: "BLOOD_INFO" },
    // ডায়াবেটিস / ওষুধ / অসুস্থ
    { text: "ডায়াবেটিস থাকলে রক্ত দেওয়া যাবে", intent: "BLOOD_INFO" },
    { text: "ওষুধ খাই রক্ত দিতে পারব", intent: "BLOOD_INFO" },
    { text: "sick person donate blood", intent: "BLOOD_INFO" },
    { text: "diabetic blood donation", intent: "BLOOD_INFO" },
    // রক্তের গ্রুপ
    { text: "সার্বজনীন রক্তদাতা কোন গ্রুপ", intent: "BLOOD_INFO" },
    { text: "universal donor blood group", intent: "BLOOD_INFO" },
    { text: "O negative universal donor", intent: "BLOOD_INFO" },
    { text: "কোন রক্তের গ্রুপ সবচেয়ে বিরল", intent: "BLOOD_INFO" },

    // ─── GREET ───────────────────────────────────────────────────────
    { text: "hello", intent: "GREET" },
    { text: "hi", intent: "GREET" },
    { text: "hey", intent: "GREET" },
    { text: "good morning", intent: "GREET" },
    { text: "good evening", intent: "GREET" },
    { text: "what can you do", intent: "GREET" },
    { text: "হ্যালো", intent: "GREET" },
    { text: "হাই", intent: "GREET" },
    { text: "আস্সালামু আলাইকুম", intent: "GREET" },
    { text: "সালাম", intent: "GREET" },
    { text: "শুভ সকাল", intent: "GREET" },
    { text: "কেমন আছো", intent: "GREET" },

    // ─── HELP ────────────────────────────────────────────────────────
    { text: "help", intent: "HELP" },
    { text: "how does this work", intent: "HELP" },
    { text: "menu", intent: "HELP" },
    { text: "show menu", intent: "HELP" },
    { text: "options", intent: "HELP" },
    { text: "সাহায্য", intent: "HELP" },
    { text: "সাহায্য করুন", intent: "HELP" },
    { text: "মেনু", intent: "HELP" },
    { text: "কি করব", intent: "HELP" },
    { text: "কিভাবে কাজ করে", intent: "HELP" },
];

export const INTENTS: Intent[] = [
    "FIND_BLOOD",
    "REGISTER_DONOR",
    "UPDATE_DONATION",
    "REQUEST_BLOOD",
    "BLOOD_INFO",
    "GREET",
    "HELP",
    "UNKNOWN",
];
