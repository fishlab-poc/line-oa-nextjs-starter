"use client";

import { useEffect, useState } from "react";

const members = {
  A001: {
    name: "Test Member 1",
    fingerprint: "FP-A001",
    version: "A",
    text: "今日盤勢維持震盪偏多，短線留意量能變化。",
  },
  A002: {
    name: "Test Member 2",
    fingerprint: "FP-A002",
    version: "B",
    text: "今日盤勢仍以震盪偏多看待，短線觀察量能變化。",
  },
  A003: {
    name: "Test Member 3",
    fingerprint: "FP-A003",
    version: "C",
    text: "盤勢暫維持震盪偏多，短線重點仍在量能變化。",
  },
};

type MemberCode = keyof typeof members;

export default function Home() {
  const [memberCode, setMemberCode] = useState<MemberCode>("A001");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const member = params.get("member");

    if (member && member in members) {
      setMemberCode(member as MemberCode);
    }
  }, []);

  const member = members[memberCode];

  const watermarkStyle: React.CSSProperties = {
    position: "fixed",
    color: "rgba(0,0,0,0.06)",
    fontSize: 18,
    fontWeight: 700,
    transform: "rotate(-25deg)",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 1,
  };

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 20px 80px",
        position: "relative",
        minHeight: "100vh",
        background: "#f7f7f7",
      }}
    >
      {/* 浮水印 */}
      <div style={{ ...watermarkStyle, top: "18%", left: "8%" }}>
        {memberCode} · {member.fingerprint}
      </div>

      <div style={{ ...watermarkStyle, top: "38%", right: "5%" }}>
        {memberCode} · {member.fingerprint}
      </div>

      <div style={{ ...watermarkStyle, top: "60%", left: "12%" }}>
        {memberCode} · {member.fingerprint}
      </div>

      <div style={{ ...watermarkStyle, top: "80%", right: "10%" }}>
        {memberCode} · {member.fingerprint}
      </div>

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
          <div
            style={{
              fontSize: 13,
              color: "#777",
              marginBottom: 8,
            }}
          >
            會員編號：{memberCode}
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#777",
              marginBottom: 20,
            }}
          >
            Fingerprint：{member.fingerprint} · Version {member.version}
          </div>

          <h2 style={{ marginTop: 0 }}>今日盤勢</h2>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
            }}
          >
            {member.text}
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
            fontSize: 12,
            color: "#999",
            textAlign: "center",
          }}
        >
          {memberCode} · 僅供本人閱讀 · 禁止轉載
        </div>
      </div>
    </main>
  );
}
