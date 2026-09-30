type Member = {
  member_code: string;
  display_name: string | null;
  status: string | null;
  expires_at: string | null;
  fingerprint_seed: string | null;
};

async function getMember(memberCode: string): Promise<Member | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase environment variables are missing");
  }

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

function getFingerprintContent(seed: string) {
  const versions = [
    {
      version: "A",
      text: "今日盤勢維持震盪偏多，短線留意量能變化。",
    },
    {
      version: "B",
      text: "今日盤勢仍以震盪偏多看待，短線觀察量能變化。",
    },
    {
      version: "C",
      text: "盤勢暫維持震盪偏多，短線重點仍在量能變化。",
    },
  ];

  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i)) % versions.length;
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

  const fingerprint =
    member.fingerprint_seed || `FP-${member.member_code}`;

  const content = getFingerprintContent(fingerprint);

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
            Fingerprint：{fingerprint} · Version {content.version}
          </div>

          <h2>今日盤勢</h2>

          <p style={{ fontSize: 18, lineHeight: 1.8 }}>
            {content.text}
          </p>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #eee",
              margin: "24px 0",
            }}
          />

          <h3>今日觀察重點</h3>

          <p style={{ lineHeight: 1.8 }}>
            ① 指數是否維持關鍵支撐
            <br />
            ② 主流族群量能是否延續
            <br />
            ③ 避免追高，等待適合的切入位置
          </p>
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
