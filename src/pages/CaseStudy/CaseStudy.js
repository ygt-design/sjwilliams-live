import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./CaseStudy.module.css";

const ACCESS_TOKEN = "J7ruXpTpvNRJGQNdJ6x4d_a2Pr396ODnIWFWVei_-1E";

// Helper function: Convert a standard YouTube or Vimeo URL to an embed URL.
const getEmbedUrl = (url) => {
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
};

// Safe helper: Get the source text from a block, ensuring it's a string.
const getBlockSource = (block) => {
  if (block.source) {
    return typeof block.source === "string"
      ? block.source
      : String(block.source);
  }
  return "";
};

const CaseStudy = () => {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the main channel for the case study.
  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true);
        // Increase perPage to 500 so that all blocks are fetched.
        const perPage = 1000;
        let page = 1;
        let allContents = [];
        let fetchedData = null;
        // Fetch all pages until we have all contents.
        do {
          const response = await fetch(
            `https://api.are.na/v2/channels/${channelId}?per=${perPage}&page=${page}`,
            { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
          );
          const data = await response.json();
          if (page === 1) {
            fetchedData = data;
          }
          allContents = allContents.concat(data.contents);
          page++;
        } while (allContents.length < fetchedData.contents_count);

        const fullChannel = { ...fetchedData, contents: allContents };
        // Only accept channels with a title starting with "-"
        if (fullChannel.title && fullChannel.title.startsWith("-")) {
          setChannel(fullChannel);
          console.log("Example block shape:", fullChannel.contents[0]);
        } else {
          setError("Channel does not meet the required criteria.");
        }
        console.log("Full Channel Contents:", fullChannel.contents);
      } catch (err) {
        console.error("Error fetching channel:", err);
        setError("Error fetching channel.");
      } finally {
        setLoading(false);
      }
    };
    console.log("channelId:", channelId);
    fetchChannel();
  }, [channelId]);

  // Fetch 3 random sticker blocks from the "Stickers" channel.
  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const response = await fetch(
          "https://api.are.na/v2/channels/stickers-aeb4empugza?per=100",
          { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
        );
        const data = await response.json();
        if (data.contents && data.contents.length > 0) {
          const contents = data.contents;
          const indices = new Set();
          while (indices.size < Math.min(3, contents.length)) {
            indices.add(Math.floor(Math.random() * contents.length));
          }
          const selected = [];
          indices.forEach((i) => selected.push(contents[i]));
          const styledStickers = selected.map((sticker) => ({
            sticker,
            left: Math.floor(Math.random() * 500 + 200) + "px",
            top: Math.floor(Math.random() * 500 + 200) + "px",
            rotation: (Math.random() * 50 - 25).toFixed(2) + "deg",
            width: Math.floor(Math.random() * 100 + 60) + "px",
          }));
          setStickers(styledStickers);
        }
      } catch (err) {
        console.error("Error fetching stickers", err);
      }
    };

    fetchStickers();
  }, []);

  const handleStickerMouseDown = (index, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const stickerItem = stickers[index];
    const startLeft = parseFloat(stickerItem.left);
    const startTop = parseFloat(stickerItem.top);

    const handleMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newLeft = startLeft + dx;
      const newTop = startTop + dy;
      setStickers((prevStickers) => {
        const newStickers = [...prevStickers];
        newStickers[index] = {
          ...newStickers[index],
          left: newLeft + "px",
          top: newTop + "px",
        };
        return newStickers;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (loading) {
    return <div>Loading case study...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  // Extract blocks from the main channel.
  const coverBlocks = channel.contents.filter(
    (block) => block.title && block.title.trim().toLowerCase().includes("cover")
  );
  const titleBlock = channel.contents.find(
    (block) => block.title && block.title.trim().toLowerCase().includes("title")
  );
  const writtenBlock = channel.contents.find(
    (block) =>
      block.title && block.title.trim().toLowerCase().includes("written")
  );
  const nameBlock = channel.contents.find(
    (block) => block.title && block.title.trim().toLowerCase().includes("name")
  );
  const pictureBlocks = channel.contents.filter(
    (block) => block.title && block.title.trim().toLowerCase() === "picture"
  );
  const mediumBlock = channel.contents.find(
    (block) => block.title && block.title.trim().toLowerCase() === "medium"
  );
  const clientBlock = channel.contents.find(
    (block) => block.title && block.title.trim().toLowerCase() === "client"
  );

  const videoBlocks = channel.contents.filter(
    (block) =>
      block.title &&
      block.title.trim().toLowerCase() === "vid" &&
      block.source &&
      block.source.url
  );

  const embeddedVideos = videoBlocks.map((block, idx) => {
    const raw = block.source.url.trim();
    const cleaned = raw.startsWith("?") ? raw.slice(1) : raw;
    const embedUrl = getEmbedUrl(cleaned);
    console.log("Raw link:", raw);
    console.log("Embed URL:", embedUrl);

    const videoIdMatch = embedUrl.match(/embed\/([^?&]+)/);
    const playlistParam = videoIdMatch ? `&playlist=${videoIdMatch[1]}` : "";

    return (
      <div key={idx} className={styles.videoWrapper}>
        <iframe
          src={`${embedUrl}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1${playlistParam}`}
          title={`Embedded Video ${idx + 1}`}
          width="100%"
          height="400"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  });

  const titleSrc =
    titleBlock && (titleBlock.image?.original?.url || titleBlock.image?.url);
  const writtenContentText = writtenBlock
    ? writtenBlock.text || writtenBlock.content || "No Written Content"
    : "No Written Content";
  const nameBlockContent = nameBlock
    ? nameBlock.text || nameBlock.content || "No Name Content"
    : "No Name Content";
  const mediumContent = mediumBlock
    ? mediumBlock.text || mediumBlock.content || "No Medium Content"
    : "No Medium Content";
  const clientContentText = clientBlock
    ? clientBlock.text || clientBlock.content || "No Client Content"
    : "No Client Content";

  return (
    <div className={styles.caseStudyContainer}>
      <div className={styles.leftSide}>
        <div className={styles.caseTitle}>
          {titleSrc ? (
            <img
              src={titleSrc}
              alt="Case Study Title"
              className={styles.caseTitleImage}
            />
          ) : (
            "No Title Image"
          )}
        </div>
        <div className={styles.subheadWrapper}>
          <div className={styles.name}>{nameBlockContent}</div>
          <div className={styles.sectionWrapper}>
            <div>Medium</div>
            <div className={styles.mediumBlock}>{mediumContent}</div>
          </div>
          <div className={styles.sectionWrapper}>
            <div>Client</div>
            <div className={styles.clientBlock}>{clientContentText}</div>
          </div>
        </div>
        <div
          className={styles.caseWritten}
          dangerouslySetInnerHTML={{
            __html: writtenContentText
              .replace(/\n/g, "<br />")
              .replace(/\s{2,}/g, (match) => "&nbsp;".repeat(match.length)),
          }}
        ></div>
        <div className={styles.stickersContainer}>
          {stickers.map((stickerItem, index) => {
            const sticker = stickerItem.sticker;
            const stickerSrc =
              sticker.image?.original?.url || sticker.image?.url;
            return stickerSrc ? (
              <div
                key={index}
                className={styles.sticker}
                style={{
                  position: "absolute",
                  left: stickerItem.left,
                  top: stickerItem.top,
                  transform: `rotate(${stickerItem.rotation})`,
                  width: stickerItem.width,
                  cursor: "grab",
                }}
                onMouseDown={(e) => handleStickerMouseDown(index, e)}
              >
                <img
                  src={stickerSrc}
                  alt={`Sticker ${index}`}
                  style={{ width: "150%" }}
                />
              </div>
            ) : null;
          })}
        </div>
      </div>
      <div className={styles.rightSide}>
        {coverBlocks.length > 0 &&
          coverBlocks.map((block, idx) => {
            const coverSrc = block.image?.original?.url || block.image?.url;
            return coverSrc ? (
              <img
                key={idx}
                src={coverSrc}
                alt={`Cover ${idx + 1}`}
                className={styles.caseCover}
              />
            ) : null;
          })}
        {pictureBlocks.length > 0 &&
          pictureBlocks.map((block, idx) => {
            const pictureSrc = block.image?.original?.url || block.image?.url;
            return pictureSrc ? (
              <img
                key={idx}
                src={pictureSrc}
                alt={`Additional ${idx + 1}`}
                className={styles.additionalImage}
              />
            ) : null;
          })}
        {embeddedVideos.length > 0 && (
          <div className={styles.videoList}>{embeddedVideos}</div>
        )}
      </div>
    </div>
  );
};

export default CaseStudy;
