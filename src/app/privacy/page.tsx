import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "개인정보 처리 안내 | WONY",
  description: "WONY 팬사이트가 콘텐츠 등록 시 받는 정보와 이용 방식을 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <LegalPageLayout label="PRIVACY" title="개인정보 처리 안내">
        <div className="flex flex-col gap-8">
          <p>
            이 사이트는 워니(WONY)를 응원하는 팬들이 자발적으로 운영하는{" "}
            <strong className="text-text">비영리 팬 프로젝트</strong>입니다.
            회사 서비스가 아니기 때문에 어렵고 딱딱한 약관 대신, 실제로 어떤
            정보를 받고 어떻게 쓰는지 최대한 쉽게 안내해드릴게요.
          </p>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif-kr text-base text-text sm:text-lg">
              회원가입은 없어요
            </h2>
            <p>
              이 사이트에는 별도의 회원가입이나 로그인 기능이 없습니다. 계정,
              비밀번호 같은 정보는 애초에 만들지도, 저장하지도 않아요.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif-kr text-base text-text sm:text-lg">
              콘텐츠를 등록할 때 받는 정보
            </h2>
            <p>편지, 팬아트, 영상을 등록하실 때 아래와 같은 정보를 입력받습니다.</p>
            <ul className="flex flex-col gap-2 pl-5">
              <li className="list-disc">닉네임</li>
              <li className="list-disc">편지 내용</li>
              <li className="list-disc">팬아트 이미지, 작품명, 작품에 남긴 한마디</li>
              <li className="list-disc">YouTube 또는 SOOP 영상 URL, 제목, 한마디</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif-kr text-base text-text sm:text-lg">
              등록한 콘텐츠는 이렇게 쓰여요
            </h2>
            <ul className="flex flex-col gap-2 pl-5">
              <li className="list-disc">
                등록하신 콘텐츠는 사이트를 통해 다른 방문자에게 공개될 수
                있습니다.
              </li>
              <li className="list-disc">
                콘텐츠는 이 사이트가 운영되는 기간 동안 보관될 수 있습니다.
              </li>
              <li className="list-disc">
                삭제나 수정을 원하시면 언제든 아래 이메일로 요청해주세요.
                확인 후 처리해드립니다.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif-kr text-base text-text sm:text-lg">
              함께 사용하는 외부 서비스
            </h2>
            <p>
              이 사이트는 아래와 같은 외부 서비스를 이용해 만들어지고
              운영됩니다. 각 서비스의 자체 정책이 함께 적용될 수 있습니다.
            </p>
            <ul className="flex flex-col gap-2 pl-5">
              <li className="list-disc">
                <strong className="text-text">Supabase</strong> — 등록된
                콘텐츠와 이미지 저장
              </li>
              <li className="list-disc">
                <strong className="text-text">Vercel</strong> — 웹사이트 호스팅
              </li>
              <li className="list-disc">
                <strong className="text-text">YouTube / SOOP</strong> — 등록된
                영상 재생
              </li>
            </ul>
            <p>
              또한 추후 추가될 &ldquo;숨겨진 별 찾기&rdquo; 같은 이벤트
              기능은 진행 상태를 저장하기 위해 브라우저의 localStorage를
              사용할 수 있습니다. 이 정보는 사용하시는 기기에만 남고, 별도로
              서버에 전송되지 않습니다.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif-kr text-base text-text sm:text-lg">
              문의 및 삭제 요청
            </h2>
            <p>
              내 콘텐츠 삭제·수정, 그 밖에 궁금한 점이 있으시면 아래 이메일로
              편하게 연락해주세요.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="w-fit text-text underline underline-offset-4 transition-colors hover:text-pink"
            >
              {CONTACT_EMAIL}
            </a>
          </section>
        </div>
      </LegalPageLayout>
    </>
  );
}
