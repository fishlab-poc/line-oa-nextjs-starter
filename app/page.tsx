type Member = {
  member_code: string;
  display_name: string | null;
  status: string | null;
  expires_at: string | null;
  fingerprint_seed: string | null;
};

type DailyContent = {
  id: number;
  publish_date: string;
  title: string | null;
  content: string | null;
  status: string | null;
};

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase environment variables are missing");
  }

  return { supabaseUrl, serviceKey };
}

async function getMember(memberCode: string): Promise<Member | null> {
  const { supabaseUrl, serviceKey } = getSupabaseConfig();

  const response = await fetch(
    `${supabaseUrl}/rest/v1/members?member_code=eq.${encodeURIComponent(
      memberCode
    )}&select=member_code,display_name,status,expires_at,fingerprint_seed&limit=1`,
    {
      headers: {
        apikey: serviceKey,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load member: ${errorText}`);
  }

  const data: Member[] = await response.json();

  return data[0] ?? null;
}

function getTaiwanDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

async function getDailyContent(): Promise<DailyContent | null> {
  const { supabaseUrl, serviceKey } = getSupabaseConfig();

  const today = getTaiwanDate();

  const response = await fetch(
    `${supabaseUrl}/rest/v1/daily_contents?publish_date=eq.${today}&status=eq.published&select=id,publish_date,title,content,status&limit=1`,
    {
      headers: {
        apikey: serviceKey,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load daily content: ${errorText}`);
  }

  const data: DailyContent[] = await response.json();

  return data[0] ?? null;
}

function getFingerprintVersion(seed: string, contentId: number) {
  const versions = ["A", "B", "C"];
  const source = `${seed}-${contentId}`;

  let hash = 0;

  for (let i = 0; i < source.length; i++) {
    hash = (hash + source.charCodeAt(i)) % versions.length;
  }

  return versions[hash];
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ member?: string }>;
}) {
  const params = await searchParams;

  const memberCode = params.member?.toUpperCase() || "A001";

  const member = await getMember(memberCode);

  if (!member) {
    return (
      <main
        style={{
          padding: 40,
          maxWidth: 720,
          margin: "0 auto",
          fontFamily: "sans-serif",
        }}
      >
        <h1>Fish Lab 會員專區</h1>
        <p>找不到此會員。</p>
      </main>
    );
  }

  if (member.status !== "active") {
    return (
      <main
        style={{
          padding: 40,
          maxWidth: 720,
          margin: "0 auto",
          fontFamily: "sans-serif",
        }}
      >
        <h1>Fish Lab 會員專區</h1>
        <p>此會員目前無閱讀權限。</p>
      </main>
    );
  }

  if (member.expires_at && new Date(member.expires_at) < new Date()) {
    return (
      <main
        style={{
          padding: 40,
          maxWidth: 720,
          margin: "0 auto",
          fontFamily: "sans-serif",
        }}
      >
        <h1>Fish Lab 會員專區</h1>
        <p>會員資格已到期。</p>
      </main>
    );
  }

  const dailyContent = await getDailyContent();

  const fingerprint =
    member.fingerprint_seed || `FP-${member.member_code}`;

  const version = dailyContent
    ? getFingerprintVersion(fingerprint, dailyContent.id)
    : "-";

  const watermark = `${member.member_code} · ${fingerprint}`;

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 20px 80px",
        minHeight: "100vh",
        background: "#f7f7f7",
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {[18, 38, 58, 78].map((top, index) => (
        <div
          key={top}
          style={{
            position: "fixed",
            top: `${top}%`,
            left: index % 2 === 0 ? "8%" : "48%",
            color: "rgba(0,0,0,0.06)",
            fontSize: 18,
            fontWeight: 700,
            transform: "rotate(-25deg)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 1,
          }}
        >
          {watermark}
        </div>
      ))}

      <div style={{ position: "relative", zIndex: 2 }}>
        <h1 style={{ marginBottom: 8 }}>Fish Lab 會員專區</h1>

        <p style={{ color: "#666", marginTop: 0 }}>
          僅供付費會員本人閱讀
        </p>

        <section
          style={{
            background: "white",
            borderRadius: 18,
            padding: 24,
            marginTop: 24,
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ color: "#777", marginBottom: 8 }}>
            會員編號：{member.member_code}
          </div>

          <div style={{ color: "#777", marginBottom: 8 }}>
            會員：{member.display_name || "未設定"}
          </div>

          <div style={{ color: "#777", marginBottom: 20 }}>
            Fingerprint：{fingerprint} · Version {version}
          </div>

          {dailyContent ? (
            <>
              <h2>{dailyContent.title || "今日盤勢"}</h2>

              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {dailyContent.content}
              </p>

              <div
                style={{
                  marginTop: 24,
                  color: "#999",
                  fontSize: 13,
                }}
              >
                發布日期：{dailyContent.publish_date}
              </div>
            </>
          ) : (
            <>
              <h2>今日盤勢</h2>

              <p style={{ fontSize: 18, lineHeight: 1.8 }}>
                今日內容尚未發布。
              </p>
            </>
          )}
        </section>

        <div
          style={{
            marginTop: 20,
            color: "#999",
            textAlign: "center",
            fontSize: 12,
          }}
        >
          {member.member_code} · 僅供本人閱讀 · 禁止轉載
        </div>
      </div>
    </main>
  );
}
