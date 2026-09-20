"use client";

import { motion, useReducedMotion } from "framer-motion";

type MessageBlock = {
  /** \n으로 줄바꿈을 표현한다. whitespace-pre-line으로 그대로 렌더링된다. */
  text: string;
  /** quote: 문장을 별도로 강조. playful: 산책 드립처럼 살짝 가벼운 톤. 생략하면 기본 문단. */
  variant?: "quote" | "playful";
};

/**
 * 워니에게 보내는 2026년 마지막 메시지 전문.
 * 문구를 수정하려면 이 배열만 고치면 된다 - 한 항목이 한 문단(fade-up 단위)이다.
 */
const MESSAGE_BLOCKS: MessageBlock[] = [
  { text: "2026년에도 참 많은 일들이 있었습니다." },
  {
    text: "오랫동안 함께했던 워냥이 중에는\n각자의 일상으로 돌아가 잠시 자리를 비운 사람도 있었고,\n아쉽게도 우리 곁을 떠난 사람도 있었습니다.",
  },
  {
    text: "하지만 그 빈자리에 또 새로운 워냥이들이 하나둘 찾아왔고,\n처음에는 서로 낯설었던 사람들이 어느새 함께 웃고 이야기하며\n새로운 추억을 만들어갔습니다.",
  },
  {
    text: "그렇게 돌아보면 2026년은\n누군가와 작별하기도 하고,\n또 새로운 누군가를 만나기도 하면서\n계속해서 새로운 이야기를 써 내려간 한 해였던 것 같습니다.",
  },
  { text: "항상 즐겁고 행복한 순간만 있었던 것은 아니었습니다." },
  {
    text: "때로는 마음이 힘든 날도 있었고,\n속상한 일이 생기기도 했고,\n생각처럼 잘 풀리지 않는 순간도 있었습니다.",
  },
  { text: "그래도 그런 순간마다\n혼자가 아니라 함께 있다는 것을 기억했으면 좋겠습니다." },
  {
    text: "슬프고 힘든 일은 함께 나누면서 조금씩 덜어내고,\n행복하고 기쁜 일은 함께 웃으면서 두 배로 만들어가는 것.",
    variant: "quote",
  },
  { text: "앞으로도 워니와 워냥이들이\n그렇게 서로에게 힘이 되어줄 수 있었으면 좋겠습니다." },
  {
    text: "방송을 하다 보면\n워냥이들이 말을 안 들어서 혼내고 싶을 때도 있었을 것이고,\n가끔은 정말 미울 때도 있었을 것 같습니다.",
  },
  {
    text: "그래도 항상 웃으면서 받아주고,\n함께 장난쳐주고,\n우리와 수많은 순간을 만들어준 워니에게\n정말 고맙다는 말을 전하고 싶습니다.",
  },
  {
    text: "덕분에 평범하게 지나갈 수도 있었던 수많은 날들이\n사진으로 남고,\n영상으로 남고,\n이렇게 다시 꺼내볼 수 있는 추억이 되었습니다.",
  },
  { text: "그리고 앞으로는...", variant: "playful" },
  {
    text: "산책은 조금만 자제하고,\n워니 방송에 더욱 집중하는 워냥이들이 되도록 노력하겠습니다.",
    variant: "playful",
  },
  { text: "물론 잘 지켜질지는 모르겠지만요.", variant: "playful" },
  { text: "그래도 언제나 워니를 응원하는 마음만큼은\n변하지 않았으면 좋겠습니다." },
  { text: "2026년의 수많은 순간을 함께 만들어줘서 고맙습니다." },
  { text: "시간이 지나 이 사이트를 다시 보게 되는 날에도" },
  { text: "그때 정말 즐거웠지", variant: "quote" },
  { text: "라고 웃으면서 이야기할 수 있었으면 좋겠습니다." },
  { text: "그리고 2027년에는" },
  {
    text: "올해보다 더 많이 웃고,\n더 좋은 사람들을 만나고,\n하고 싶은 일들을 마음껏 하면서\n행복한 순간들이 가득했으면 좋겠습니다.",
  },
  { text: "워니도,\n그리고 모든 워냥이들도" },
  { text: "건강하고 행복한 한 해가 되기를 바랍니다." },
  { text: "언제나 고맙습니다." },
  { text: "2027년에도 잘 부탁드립니다. ✦" },
];

function blockClassName(variant: MessageBlock["variant"]) {
  if (variant === "quote") {
    return "font-serif-kr text-lg italic leading-loose text-star/80 sm:text-xl";
  }
  if (variant === "playful") {
    return "font-serif-kr text-base italic leading-loose text-text-soft sm:text-lg";
  }
  return "font-serif-kr text-base leading-loose text-text sm:text-lg";
}

export default function SurpriseMessage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="px-6 py-32 sm:py-40">
      <div className="mx-auto flex max-w-[700px] flex-col items-center gap-16 text-center sm:gap-20">
        {MESSAGE_BLOCKS.map((block, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={
              prefersReducedMotion ? { duration: 0.4 } : { duration: 1.1, ease: "easeOut" }
            }
            className={`whitespace-pre-line ${blockClassName(block.variant)}`}
          >
            {block.text}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
