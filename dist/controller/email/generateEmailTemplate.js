"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Function to generate dynamic HTML content based on template type
const generateEmailTemplate = (type, data) => {
    switch (type) {
        case 'otp':
        case 'verifyEmail':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>ব্লাড ডোনার ওটিপি যাচাই</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>যাচাইকরণ কোড</h3>
                        <p>প্রিয় ব্যবহারকারী,</p>
                        <p>আপনার অ্যাকাউন্ট যাচাইকরণের জন্য ওটিপি হল:</p>
                        <div style="text-align: center; padding: 15px; background-color: #f5f5f5; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                            ${data.otp}
                        </div>
                        <p>এই কোডটি ১০ মিনিটের মধ্যে মেয়াদ শেষ হবে।</p>
                        <p>আপনি যদি এই কোড অনুরোধ না করে থাকেন, তাহলে অনুগ্রহ করে এই ইমেলটি উপেক্ষা করুন।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার টিম</p>
                    </div>
                </div>
            `;
        case 'forgot-password':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>পাসওয়ার্ড রিসেট</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>আপনার নতুন পাসওয়ার্ড</h3>
                        <p>প্রিয় ${data.name},</p>
                        <p>আপনার পাসওয়ার্ড রিসেট করা হয়েছে। আপনার নতুন পাসওয়ার্ড হল:</p>
                        <div style="text-align: center; padding: 15px; background-color: #f5f5f5; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                            ${data.newPassword}
                        </div>
                        <p style="color: #f44336; font-weight: bold;">সুরক্ষার জন্য, অনুগ্রহ করে লগইন করার পর অবিলম্বে আপনার পাসওয়ার্ড পরিবর্তন করুন।</p>
                        <p>আপনি যদি এই পাসওয়ার্ড রিসেট অনুরোধ না করে থাকেন, তাহলে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার টিম</p>
                    </div>
                </div>
            `;
        case 'support':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>ব্লাড ডোনার সাপোর্ট</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>${data.supportTitle || 'সাপোর্ট প্রতিক্রিয়া'}</h3>
                        <p>প্রিয় ${data.name},</p>
                        <p>${data.message}</p>
                        <p>আপনার যদি আরও কোন প্রশ্ন থাকে, তাহলে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করতে দ্বিধা করবেন না।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার সাপোর্ট টিম</p>
                    </div>
                </div>
            `;
        case 'moneyDonation':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>অর্থ অনুদানের রসিদ</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>অর্থ অনুদান নিশ্চিতকরণ</h3>
                        <p>প্রিয় ${data.donorName || 'দাতা'},</p>
                        <p>আপনার অর্থ অনুদান সফলভাবে গৃহীত হয়েছে। আপনার অবদানের জন্য আন্তরিক ধন্যবাদ!</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50;">
                            <h4 style="margin-top: 0; color: #4CAF50;">অনুদানের বিবরণ:</h4>
                            <p><strong>লেনদেন আইডি:</strong> ${data.tranId}</p>
                            <p><strong>পরিমাণ:</strong> ${data.amount || '----'} টাকা</p>
                            <p><strong>তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')}</p>
                        </div>
                        
                        <p>${data.message || 'আপনার অনুদান একটি মহৎ উদ্যোগের অংশ। আপনার সহায়তায় আমরা রক্তদাতাদের সহায়তা, প্রশিক্ষণ এবং সচেতনতা কার্যক্রম অব্যাহত রাখতে পারব। একটি জীবন বাঁচাতে আপনার অবদান প্রতিফলিত হবে একটি পরিবারের হাসিতে, একটি মাতার স্বস্তিতে, বা একটি ভবিষ্যতে। শান্তি ও প্রশান্তির এই পথে আপনার সঙ্গী হওয়ার জন্য আপনাকে আন্তরিক কৃতজ্ঞতা জানাই।'}</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${data.invoiceUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                                রসিদ দেখুন/ডাউনলোড করুন
                            </a>
                        </div>
                        
                        <p>আপনার কোন প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করতে দ্বিধা করবেন না।</p>
                        
                        <p>আবারও ধন্যবাদ আপনার উদারতার জন্য।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার টিম</p>
                    </div>
                    <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
                        <p>এই ইমেইল স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে। অনুগ্রহ করে এই ইমেইলের উত্তর দিবেন না।</p>
                        <p>&copy; ${new Date().getFullYear()} ব্লাড ডোনার। সর্বস্বত্ব সংরক্ষিত।</p>
                    </div>
                </div>
            `;
        case 'bloodRequest':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>জরুরী রক্ত দরকার</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>রক্তদান অনুরোধ</h3>
                        <p>প্রিয় ${data?.name},</p>
                        <p>আমাদের কাছে <strong>${data.bloodGroup}</strong> রক্তের একটি জরুরী অনুরোধ এসেছে:</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336;">
                            <h4 style="margin-top: 0;">রোগীর তথ্য:</h4>
                            <p><strong>নাম:</strong> ${data.patientName || 'অজানা'}</p>
                            ${data.patientAge ? `<p><strong>বয়স:</strong> ${data.patientAge} বছর</p>` : ''}
                            ${data.patientGender ? `<p><strong>লিঙ্গ:</strong> ${data.patientGender === 'male' ? 'পুরুষ' : data.patientGender === 'female' ? 'মহিলা' : 'অন্যান্য'}</p>` : ''}
                            ${data.patientProblem ? `<p><strong>সমস্যা:</strong> ${data.patientProblem}</p>` : ''}
                            <p><strong>রক্তের গ্রুপ:</strong> ${data.bloodGroup}</p>
                            ${data.bloodUnits ? `<p><strong>প্রয়োজনীয় ইউনিট:</strong> ${data.bloodUnits}</p>` : ''}
                            ${data.reason ? `<p><strong>কারণ:</strong> ${data.reason}</p>` : ''}
                        </div>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3;">
                            <h4 style="margin-top: 0;">হাসপাতালের তথ্য:</h4>
                            <p><strong>হাসপাতাল:</strong> ${data.hospital}</p>
                            ${data.hospitalWard ? `<p><strong>ওয়ার্ড:</strong> ${data.hospitalWard}</p>` : ''}
                            <p><strong>ঠিকানা:</strong> ${data.address}</p>
                            <p><strong>প্রয়োজনীয় তারিখ:</strong> ${data.requiredDate || 'যত দ্রুত সম্ভব'}</p>
                            ${data.requiredTime ? `<p><strong>প্রয়োজনীয় সময়:</strong> ${data.requiredTime}</p>` : ''}
                        </div>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50;">
                            <h4 style="margin-top: 0;">যোগাযোগের তথ্য:</h4>
                            <p><strong>প্রাথমিক যোগাযোগ:</strong> ${data.contact}</p>
                            ${data.alternativeContact ? `<p><strong>বিকল্প যোগাযোগ:</strong> ${data.alternativeContact}</p>` : ''}
                        </div>
                        
                        <p style="font-weight: bold; color: #f44336;">আপনার রক্তদান একটি জীবন বাঁচাতে পারে। আপনি যদি রক্তদান করতে পারেন, তাহলে অনুগ্রহ করে উল্লিখিত নম্বরে যোগাযোগ করুন।</p>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="tel:${data.contact}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-right: 10px;">কল করুন</a>
                            <a href="${data.responseLink || 'https://blooddonar.org/respond'}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">সাড়া দিন</a>
                        </div>
                        
                        <p>আপনার দয়া এবং উদারতার জন্য ধন্যবাদ।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার টিম</p>
                    </div>
                </div>
            `;
        case 'remindDonation':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>${data.isNewDonor === 'true' ? 'আপনার প্রথম রক্তদান' : 'আপনার রক্তদানের সময় হয়েছে'}</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>${data.isNewDonor === 'true' ? 'আপনি কি রক্তদান করেছেন?' : 'রক্তদানের সময় হয়েছে'}</h3>
                        <p>প্রিয় ${data.name},</p>
                        ${data.isNewDonor === 'true' ?
                `<p>আমাদের রেকর্ডে আপনার রক্তদানের কোন তথ্য নেই। আপনি যদি আগে কখনো রক্তদান করে থাকেন, তাহলে অনুগ্রহ করে আপনার প্রোফাইলে তা আপডেট করুন। আপনি যদি আগে রক্তদান না করে থাকেন, তাহলে এই সুযোগটি নিন।</p>` :
                `<p>আপনার শেষ রক্তদানের তারিখ থেকে প্রায় ৩ মাস পার হয়ে গেছে। আপনি আবার রক্তদান করার জন্য প্রস্তুত!</p>`}
                        
                        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #f44336;">
                            <h4>রক্তদানের উপকারিতা:</h4>
                            <ul style="padding-left: 20px;">
                                <li>এক ইউনিট রক্তদান তিনটি পর্যন্ত জীবন বাঁচাতে পারে</li>
                                <li>শরীরে নতুন রক্ত কোষ উৎপাদন উদ্দীপিত করে</li>
                                <li>হৃদরোগের ঝুঁকি কমায়</li>
                                <li>ক্যালোরি বার্ন করে</li>
                                <li>বিনামূল্যে স্বাস্থ্য পরীক্ষা পাওয়া যায়</li>
                                <li>মানসিক সুস্থতা বাড়ায়</li>
                            </ul>
                        </div>
                        
                        <p>আপনার রক্তদান জীবন বাঁচাতে সাহায্য করে। আপনি যদি আগ্রহী হন, তাহলে আমাদের অ্যাপে লগইন করে রক্তদান করার সময় নির্ধারণ করুন।</p>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${data.donationLink || 'https://blooddonar.org/donate'}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">আমার প্রথম রক্তদান সময়সূচী তৈরি করুন</a>
                        </div>
                        
                        <div style="border-top: 1px solid #e0e0e0; margin-top: 20px; padding-top: 20px;">
                            <p><strong>${data.isNewDonor === 'true' ? 'ইতিমধ্যে রক্তদান করেছেন?' : 'অন্যত্র রক্তদান করেছেন?'}</strong> ${data.isNewDonor === 'true' ? 'আপনি যদি আগে রক্তদান করে থাকেন, অনুগ্রহ করে আপনার প্রোফাইলে আপনার আগের রক্তদানের তথ্য যোগ করুন।' : 'যদি আপনি গত ৪ মাসের মধ্যে অন্যত্র রক্তদান করে থাকেন, অনুগ্রহ করে আপনার প্রোফাইলে তথ্য আপডেট করুন যাতে আমরা আপনার রক্তদানের ইতিহাস সঠিকভাবে রাখতে পারি।'}</p>
                            <div style="text-align: center; margin: 15px 0;">
                                <a href="${data.updateLink || 'https://blooddonar.org/profile/donation-history'}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: inline-block; border: 2px solid #2196F3;">আমার রক্তদানের তথ্য আপডেট করুন</a>
                            </div>
                        </div>
                        
                        <p>আপনার দয়া এবং সহযোগিতার জন্য ধন্যবাদ।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার টিম</p>
                    </div>
                </div>
            `;
        case 'nextDonationReminder':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>আপনার পরবর্তী রক্তদান - সুরক্ষিত থাকুন</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>রক্তদান করার জন্য প্রস্তুতি নিন</h3>
                        <p>প্রিয় ${data.name},</p>
                        <p>আপনার পরবর্তী রক্তদান তারিখ (${data.nextDonationDate || 'শীঘ্রই'}) আসছে। আপনি আবার রক্তদান করে একটি মূল্যবান জীবন বাঁচাতে পারেন!</p>
                        
                        <div style="background-color: #fff3cd; padding: 15px; margin: 15px 0; border-left: 4px solid #ffc107;">
                            <h4 style="color: #856404;">প্রতারণা থেকে সতর্ক থাকুন:</h4>
                            <ul style="padding-left: 20px;">
                                <li>কখনোই অপরিচিত ব্যক্তি বা প্রতিষ্ঠানকে অর্থ প্রদান করবেন না</li>
                                <li>রোগীর পরিবারের সাথে সরাসরি যোগাযোগ করুন</li>
                                <li>রক্তদানের জন্য কখনো টাকা নেবেন না</li>
                                <li>আমাদের অফিসিয়াল অ্যাপ ছাড়া অন্য মাধ্যমে ব্যক্তিগত তথ্য শেয়ার করবেন না</li>
                                <li>বিশ্বস্ত হাসপাতাল বা ব্লাড ব্যাংকে রক্তদান করুন</li>
                                <li>সন্দেহজনক অনুরোধ পেলে আমাদের সাথে যোগাযোগ করুন</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #d4edda; padding: 15px; margin: 15px 0; border-left: 4px solid #28a745;">
                            <h4 style="color: #155724;">রক্তদানের পরে যত্ন:</h4>
                            <ul style="padding-left: 20px;">
                                <li>প্রথম ৪ ঘণ্টা ভারী কাজ এড়িয়ে চলুন</li>
                                <li>প্রচুর পানি পান করুন</li>
                                <li>আয়রন সমৃদ্ধ খাবার গ্রহণ করুন (যেমন: পালং শাক, মাংস, ডিম)</li>
                                <li>রক্তদানের স্থানে ২৪ ঘণ্টা ব্যান্ডেজ রাখুন</li>
                                <li>কোন অস্বাভাবিক উপসর্গ দেখা দিলে চিকিৎসকের পরামর্শ নিন</li>
                                <li>আমাদের অ্যাপে আপনার রক্তদানের তথ্য আপডেট করুন</li>
                            </ul>
                        </div>
                        
                        <p>আপনার রক্তদান তিনটি পর্যন্ত জীবন বাঁচাতে পারে। সকল রক্তদাতাদের জন্য আমাদের গভীর কৃতজ্ঞতা ও শ্রদ্ধা রইল।</p>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${data.donationLink || 'https://blooddonar.org/donate'}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">রক্তদান সময়সূচী তৈরি করুন</a>
                        </div>
                        
                        <p>যদি আপনার রক্তদান সম্পর্কে কোন প্রশ্ন থাকে, তাহলে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার টিম</p>
                    </div>
                </div>
            `;
        default:
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h3>ব্লাড ডোনার থেকে বার্তা</h3>
                    <p>${data.message}</p>
                </div>
            `;
    }
};
exports.default = generateEmailTemplate;
