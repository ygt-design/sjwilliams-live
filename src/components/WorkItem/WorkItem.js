import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./WorkItem.module.css";

const ACCESS_TOKEN = "J7ruXpTpvNRJGQNdJ6x4d_a2Pr396ODnIWFWVei_-1E";

const WorkItem = ({ channel, index }) => {
  const [fullChannel, setFullChannel] = useState(channel);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFullChannel = async () => {
      setLoading(true);
      try {
        const perPage = 500;
        let page = 1;
        let allContents = [];
        let fetchedData = null;

        do {
          const response = await fetch(
            `https://api.are.na/v2/channels/${channel.id}?per=${perPage}&page=${page}`,
            {
              headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
            }
          );
          const data = await response.json();
          if (page === 1) {
            fetchedData = data;
          }
          allContents = allContents.concat(data.contents);
          page++;
        } while (allContents.length < fetchedData.contents_count);

        const fullChannelData = { ...fetchedData, contents: allContents };
        setFullChannel(fullChannelData);
      } catch (error) {
        console.error("Error fetching full channel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullChannel();
  }, [channel]);

  if (!channel.title || !channel.title.startsWith("-")) {
    return null;
  }

  const coverBlocks =
    fullChannel.contents?.filter((block) => {
      return block.title && block.title.trim().toLowerCase() === "cover";
    }) || [];

  const titleBlocks =
    fullChannel.contents?.filter((block) => {
      return block.title && block.title.trim().toLowerCase() === "title";
    }) || [];

  return (
    <Link
      to={`/case-study/${channel.id}`}
      className={styles.workItemLink}
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className={`${styles.workItem} ${styles.fadeIn}`}>
        {loading && <p>Loading full channel data...</p>}
        <div className={styles.blocksContainer}>
          <div className={styles.coverBlocks}>
            {coverBlocks.length > 0 ? (
              coverBlocks.map((block, i) => (
                <div key={`cover-${i}`} className={styles.coverBlock}>
                  {block.class && block.class.toLowerCase() === "image" && (
                    <img
                      src={block.image?.original?.url || block.image?.url}
                      alt="Cover"
                      className={styles.blockImage}
                    />
                  )}
                  {block.class &&
                    block.class.toLowerCase() === "attachment" && (
                      <a href={block.attachment?.url}>Attachment</a>
                    )}
                  {!block.class && <p>{block.title}</p>}
                </div>
              ))
            ) : (
              <p>No Cover Blocks Found</p>
            )}
          </div>
          <div className={styles.titleBlocks}>
            {titleBlocks.length > 0 ? (
              titleBlocks.map((block, i) => (
                <div key={`title-${i}`} className={styles.titleBlock}>
                  {block.class && block.class.toLowerCase() === "image" && (
                    <img
                      src={block.image?.original?.url || block.image?.url}
                      alt="Title"
                      className={styles.blockImage}
                    />
                  )}
                  {block.class &&
                    block.class.toLowerCase() === "attachment" && (
                      <a href={block.attachment?.url}>Attachment</a>
                    )}
                  {(!block.class ||
                    (block.class.toLowerCase() !== "image" &&
                      block.class.toLowerCase() !== "attachment")) && (
                    <p>{block.title}</p>
                  )}
                </div>
              ))
            ) : (
              <p>No Title Blocks Found</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorkItem;
export { WorkItem };
