// Define email template types
export type EmailType = 'otp' | 'support' | 'bloodRequest' | 'verifyEmail' | 'forgot-password' | 'remindDonation';

// Function to generate dynamic HTML content based on template type
const generateEmailTemplate = (type: EmailType, data: any): string => {
    console.log("generate email template",type, data);
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
                        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0;">
                            <p><strong>হাসপাতাল:</strong> ${data.hospital}</p>
                            <p><strong>ঠিকানা:</strong> ${data.address}</p>
                            <p><strong>যোগাযোগ:</strong> ${data.contact}</p>
                            <p><strong>প্রয়োজনীয় সময়:</strong> ${data.requiredBy}</p>
                        </div>
                        <p>আপনার রক্তদান একটি জীবন বাঁচাতে পারে। আপনি যদি রক্তদান করতে পারেন, তাহলে অনুগ্রহ করে এই ইমেইলের উত্তর দিন অথবা প্রদত্ত নম্বরে যোগাযোগ করুন।</p>
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
                          `<p>আপনার শেষ রক্তদানের তারিখ থেকে প্রায় ৩ মাস পার হয়ে গেছে। আপনি আবার রক্তদান করার জন্য প্রস্তুত!</p>`
                        }
                        
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
                            <a href="${data.donationLink || 'https://blooddonar.org/donate'}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">${data.isNewDonor === 'true' ? 'আমার প্রথম রক্তদান সময়সূচী তৈরি করুন' : 'রক্তদান সময়সূচী তৈরি করুন'}</a>
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
            
        default:
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h3>ব্লাড ডোনার থেকে বার্তা</h3>
                    <p>${data.message}</p>
                </div>
            `;
    }
};

export default generateEmailTemplate;