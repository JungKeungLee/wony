import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "콘텐츠 삭제 요청 | WONY",
  description: "등록된 편지, 팬아트, 영상의 삭제나 수정을 요청하는 방법을 안내합니다.",
};

export default function ContentRemovalPage() {
  return (
    <>
      <Navigation />
      <LegalPageLayout label="REQUEST" title="콘텐츠 삭제 요청">
        <div className="flex flex-col gap-8">
          <p>
            사이트에 등록하신 편지, 팬아트, 영상 중 삭제하거나 수정하고 싶은
            콘텐츠가 있다면 아래 이메일로 요청해주세요. 확인 후 조치해드립니다.
          </p>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif-kr text-base text-text sm:text-lg">
              삭제·수정 요청 이메일
            </h2>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="w-fit text-lg text-text underline underline-offset-4 transition-colors hover:text-pink sm:text-xl"
            >
              {CONTACT_EMAIL}
            </a>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif-kr text-base text-text sm:text-lg">
              이런 내용을 함께 보내주시면 더 빨리 확인할 수 있어요
            </h2>
            <ul className="flex flex-col gap-2 pl-5">
              <li className="list-disc">작성자 닉네임</li>
              <li className="list-disc">콘텐츠 종류 (편지 / 팬아트 / 영상)</li>
              <li className="list-disc">콘텐츠 제목 또는 내용 일부</li>
              <li className="list-disc">삭제 또는 수정을 원하는 이유</li>
              <li className="list-disc">해당 콘텐츠 링크 (가능한 경우)</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-serif-kr text-base text-text sm:text-lg">
              저작권 관련 요청도 받고 있어요
            </h2>
            <p>
              팬아트 등 콘텐츠에 대한 저작권 관련 삭제 요청도 동일한
              이메일({" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-text underline underline-offset-4 transition-colors hover:text-pink"
              >
                {CONTACT_EMAIL}
              </a>
              )로 받고 있습니다. 확인되는 대로 빠르게 처리해드리겠습니다.
            </p>
          </section>
        </div>
      </LegalPageLayout>
    </>
  );
}
