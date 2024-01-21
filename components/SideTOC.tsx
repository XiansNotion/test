import React, { useEffect, useRef, useState } from "react";

interface Link {
  id: string;
  title: string;
  level: number;
  active: boolean;
}

interface SideTOCProps {
  links: Link[];
  anchorName: string;
  minLevel: number;
  visibleHeight?: number;
}

const SideTOC: React.FC<SideTOCProps> = ({
  links: _links,
  anchorName,
  minLevel,
  visibleHeight = 48,
}) => {
  const [show, setShow] = useState(false);
  const [links, setLinks] = useState<Link[]>(_links);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  const getActiveLinkID = (): string | null => {
  const anchors = Array.from(document.querySelectorAll(`.${anchorName}`));
  const activeAnchors = anchors
    .map((anchor) => ({
      top: anchor.getBoundingClientRect().top,
      id: anchor.id,
    }))
    .filter((item) => item.top <= 10)
    .sort((a, b) => b.top - a.top);
  return activeAnchors[0]?.id || null;
  };

  useEffect(() => {
    setLinks(
      _links.map((curr) => ({
        ...curr,
        active: curr.id === activeLink,
      }))
    );

    const activeElement = document.getElementById(`link-${activeLink}`);
    if (activeElement) {
      const activeOffset = activeElement.offsetTop + 40;
      tocRef.current?.scrollTo({ top: activeOffset - 100, behavior: "smooth" });
    }
  }, [activeLink, _links]);

  const handleScrollDirection = () => {
    setActiveLink(getActiveLinkID());
    if (window.scrollY < visibleHeight) {
      setShow(false);
    } else {
      setShow(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScrollDirection);
    return () => {
      window.removeEventListener("scroll", handleScrollDirection);
    };
  }, []);

  if (links.length === 0) return null;

  return (
    <div
      ref={tocRef}
      className={`toc fixed top-24 hidden lg:block bottom-8 w-[inherit] origin-[0_0] overflow-y-auto border-gray-300 dark:border-gray-700 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <ul className="border-gray-300 dark:border-gray-700 border-l-[2px]">
        {links.map(({ id, title, level, active }) => (
          <li
            key={id}
            id={`link-${id}`}
            className={active ? "active-anchor-link" : ""}
            style={{ marginLeft: level - minLevel + "rem" }}
          >
            <a href={`#${id}`}>{title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(SideTOC);
