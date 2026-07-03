import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // ১. ফ্রন্টএন্ড থেকে পাঠানো ডেটা রিসিভ করা
    const { workerId, name, role, department, status, phone } = body;

    // ২. কর্মী আইডি (workerId) পাঠানো হয়েছে কিনা তা চেক করা (এটি বাধ্যতামূলক)
    if (!workerId) {
      return NextResponse.json(
        { success: false, message: "কর্মচারীর আইডি (workerId) প্রদান করা বাধ্যতামূলক।" },
        { status: 400 }
      );
    }

    console.log(`Updating employee record for Worker ID: ${workerId}`);

    // ৩. ডামি আপডেট রেসপন্স (পরবর্তীতে এখানে আপনার MongoDB/Mongoose-এর আসল আপডেট লজিক কাজ করবে)
    const updatedEmployeeData = {
      workerId,
      name: name || "H.M. Alim Uddin", // নতুন ডেটা না পাঠালে আগেরটাই বহাল থাকবে
      role: role || "Software Developer",
      department: department || "IT Dept",
      phone: phone || "+966500000000",
      status: status || "Active",
      updatedAt: new Date().toISOString()
    };

    // ৪. সফলভাবে আপডেট হওয়ার রেসপন্স পাঠানো
    return NextResponse.json(
      { 
        success: true, 
        message: "কর্মচারীর তথ্য সফলভাবে আপডেট করা হয়েছে!", 
        data: updatedEmployeeData 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Update Employee API Error:", error);
    return NextResponse.json(
      { success: false, message: "কর্মচারীর তথ্য আপডেট করার সময় সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}