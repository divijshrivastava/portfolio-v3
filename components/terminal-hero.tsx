'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const COMMAND = 'cat about.yml';
const TYPING_SPEED = 45;

export function TerminalHero() {
  const prefersReducedMotion = useReducedMotion();
  const [typedChars, setTypedChars] = useState(prefersReducedMotion ? COMMAND.length : 0);
  const [showContent, setShowContent] = useState(!!prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (typedChars < COMMAND.length) {
      const timeout = setTimeout(() => setTypedChars((c) => c + 1), TYPING_SPEED);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setShowContent(true), 400);
      return () => clearTimeout(timeout);
    }
  }, [typedChars, prefersReducedMotion]);

  return (
    <div className="rounded-lg overflow-hidden border border-white/[0.08] shadow-[0_0_60px_-15px] shadow-brand/20">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] text-white/30 ml-2 font-mono">~/portfolio</span>
      </div>

      {/* Terminal body */}
      <div className="bg-[#0d1117] px-5 py-4 font-mono text-[13px] sm:text-sm leading-[1.8] text-[#c9d1d9] overflow-x-auto">
        {/* Command line */}
        <div className="flex">
          <span className="text-brand select-none">$&nbsp;</span>
          <span>{COMMAND.slice(0, typedChars)}</span>
          {!showContent && (
            <span className="inline-block w-[7px] h-[18px] bg-brand/70 ml-px animate-[blink_1s_steps(2)_infinite]" />
          )}
        </div>

        {/* YAML content */}
        {showContent && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-2"
          >
            <div className="text-white/25 select-none"># about.yml</div>
            <YamlLine k="name" v="Divij Shrivastava" />
            <YamlLine k="role" v="Senior Backend Engineer" />
            <YamlLine k="experience" v="8+ years" />
            <YamlLine k="companies" v="[Morgan Stanley, TIAA, TCS]" bracket />

            <div className="h-3" />

            <div>
              <span className="text-brand">highlights</span>
              <span className="text-white/40">:</span>
            </div>
            <YamlListItem text="Replaced FactSet RMS ($6-fig/user) with in-house trading platform" />
            <YamlListItem text="Architected 9-system integration incl. BlackRock Aladdin" />
            <YamlListItem text="Led ESG analytics platform from zero to production" />
            <YamlListItem text="Event-driven architecture on Kafka at scale" />

            <div className="h-3" />

            <div className="flex flex-wrap">
              <span className="text-brand">stack</span>
              <span className="text-white/40">:&nbsp;</span>
              <span className="text-white/40">[</span>
              <span>Java, Spring Boot, Kafka, Elasticsearch, Python, PostgreSQL, MongoDB, Docker</span>
              <span className="text-white/40">]</span>
            </div>

            <div className="h-3" />

            <YamlLine k="recognition" v="2x Tech Showcase Winner" />

            {/* Bottom prompt */}
            <div className="mt-3 flex">
              <span className="text-brand select-none">$&nbsp;</span>
              <span className="inline-block w-[7px] h-[18px] bg-brand/70 animate-[blink_1s_steps(2)_infinite]" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function YamlLine({ k, v, bracket }: { k: string; v: string; bracket?: boolean }) {
  return (
    <div>
      <span className="text-brand">{k}</span>
      <span className="text-white/40">: </span>
      {bracket ? (
        <span className="text-[#c9d1d9]">{v}</span>
      ) : (
        <span>{v}</span>
      )}
    </div>
  );
}

function YamlListItem({ text }: { text: string }) {
  return (
    <div className="pl-4">
      <span className="text-brand/60 select-none">- </span>
      <span>{text}</span>
    </div>
  );
}
