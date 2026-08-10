const API_BASE = "http://127.0.0.1:8000";


export const api = {


  async register(
    full_name: string,
    email: string,
    password: string
  ) {

    const res = await fetch(
      `${API_BASE}/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          full_name,
          email,
          password,
        }),
      }
    );


    if (!res.ok) {
      throw new Error(await res.text());
    }


    return await res.json();
  },




  async login(
    email: string,
    password: string
  ) {

    const form = new URLSearchParams();

    form.append("username", email);
    form.append("password", password);


    const res = await fetch(
      `${API_BASE}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: form,
      }
    );


    if (!res.ok) {
      throw new Error(await res.text());
    }


    const data = await res.json();


    localStorage.setItem(
      "token",
      data.access_token
    );


    return data;
  },





  async uploadReport(
    file: File
  ) {

    const token =
      localStorage.getItem("token");


    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );


    const res = await fetch(
      `${API_BASE}/reports/upload`,
      {
        method: "POST",

        headers: {
          Authorization:
          `Bearer ${token}`,
        },

        body: formData,
      }
    );


    if (!res.ok) {
      throw new Error(await res.text());
    }


    return await res.json();
  },





  async getDashboard() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/dashboard/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
},





  async getHistory() {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/history/`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },






  async getReportDetails(report_id: number) {

  console.log("========== REPORT DEBUG ==========");
  console.log("Report ID:", report_id);
  console.log("API URL:", `${API_BASE}/reports/${report_id}`);

  const token = localStorage.getItem("token");

  console.log("Token:", token);

  const res = await fetch(
    `${API_BASE}/reports/${report_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log("Status:", res.status);

  const text = await res.text();

  console.log("Response:", text);

  if (!res.ok) {
    throw new Error(text);
  }

  return JSON.parse(text);
},





  async downloadReport(
    report_id:number
  ){

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/reports/${report_id}/download`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    const blob =
      await res.blob();


    const url =
      window.URL.createObjectURL(blob);


    const a =
      document.createElement("a");


    a.href=url;


    a.download =
      `MediMind_Report_${report_id}.pdf`;


    document.body.appendChild(a);


    a.click();


    a.remove();


    window.URL.revokeObjectURL(url);

  },







  async getProfile(){

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/users/me`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();

  },
  async getDoctorDashboard() {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_BASE}/doctor/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
},







  async updateProfile(
    data:{ full_name: string }
  ){

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/users/me`,
      {
        method:"PUT",

        headers:{
          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${token}`,
        },


        body:
        JSON.stringify(data),

      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();

  },

  async askAI(report_text: string, question: string) {

  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_BASE}/chat/ask`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        report_text,
        question,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
},


  async compareReports(reportAId?: number, reportBId?: number) {

    const token =
      localStorage.getItem("token");


    const params = new URLSearchParams();

    if (reportAId !== undefined && reportBId !== undefined) {
      params.set("report_a_id", String(reportAId));
      params.set("report_b_id", String(reportBId));
    }

    const query = params.toString();


    const res = await fetch(
      `${API_BASE}/comparison/${query ? `?${query}` : ""}`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },





  async getNotifications() {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/notifications/`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async getUnreadNotificationCount() {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/notifications/unread-count`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async markNotificationRead(notificationId: number) {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/notifications/${notificationId}/read`,
      {
        method:"PATCH",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async markAllNotificationsRead() {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/notifications/read-all`,
      {
        method:"PATCH",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async deleteNotification(notificationId: number) {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/notifications/${notificationId}`,
      {
        method:"DELETE",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async clearAllNotifications() {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/notifications/clear`,
      {
        method:"DELETE",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async getInsights() {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/insights/`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async getInsightTrends() {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/insights/trends`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async getInsightRecommendations() {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/insights/recommendations`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async getInsightHistory() {

    const token =
      localStorage.getItem("token");


    const res = await fetch(
      `${API_BASE}/insights/history`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  async searchReports(params: {
    q?: string;
    risk_level?: string[];
    overall_status?: string[];
    report_type?: string[];
    min_score?: number;
    max_score?: number;
    date_from?: string;
    date_to?: string;
    quick_range?: string;
    sort?: string;
    page?: number;
    page_size?: number;
  }) {

    const token =
      localStorage.getItem("token");


    const search =
      new URLSearchParams();


    if (params.q) search.set("q", params.q);
    if (params.min_score !== undefined) search.set("min_score", String(params.min_score));
    if (params.max_score !== undefined) search.set("max_score", String(params.max_score));
    if (params.date_from) search.set("date_from", params.date_from);
    if (params.date_to) search.set("date_to", params.date_to);
    if (params.quick_range) search.set("quick_range", params.quick_range);
    if (params.sort) search.set("sort", params.sort);
    if (params.page !== undefined) search.set("page", String(params.page));
    if (params.page_size !== undefined) search.set("page_size", String(params.page_size));

    (params.risk_level || []).forEach((v) => search.append("risk_level", v));
    (params.overall_status || []).forEach((v) => search.append("overall_status", v));
    (params.report_type || []).forEach((v) => search.append("report_type", v));


    const res = await fetch(
      `${API_BASE}/reports/search?${search.toString()}`,
      {
        method:"GET",

        headers:{
          Authorization:
          `Bearer ${token}`,
        },
      }
    );


    if(!res.ok){
      throw new Error(
        await res.text()
      );
    }


    return await res.json();
  },


  logout(){

    localStorage.removeItem(
      "token"
    );

  },





  isAuthed(){

    return !!localStorage.getItem(
      "token"
    );

  },


};