import React, { useState, useEffect, useRef } from "react";
import styles from "./About.module.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import modelPath from "../../assets/modal/steveHead.glb";

const ACCESS_TOKEN = "J7ruXpTpvNRJGQNdJ6x4d_a2Pr396ODnIWFWVei_-1E";

function RotatingModel({ modelPath }) {
  const gltf = useGLTF(modelPath);
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta;
    }
  });
  return (
    <group ref={ref} scale={[10, 10, 10]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

const About = () => {
  const [aboutText, setAboutText] = useState("");
  const [clientText, setClientText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAboutChannel = async () => {
      try {
        setLoading(true);
        const perPage = 100;
        let page = 1;
        let allContents = [];
        let fetchedData = null;

        do {
          const response = await fetch(
            `https://api.are.na/v2/channels/about-vb0bri_ftic?per=${perPage}&page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (page === 1) {
            fetchedData = data;
          }
          allContents = allContents.concat(data.contents);
          page++;
        } while (allContents.length < fetchedData.contents_count);
        const fullChannel = { ...fetchedData, contents: allContents };

        const aboutBlock = fullChannel.contents.find(
          (block) =>
            block.title && block.title.trim().toLowerCase() === "about text"
        );
        if (aboutBlock) {
          setAboutText(aboutBlock.text || aboutBlock.content || "");
        } else {
          setAboutText("No About Text content found.");
        }

        const clientBlock = fullChannel.contents.find(
          (block) => block.id == "35613016"
        );
        if (clientBlock) {
          setClientText(
            clientBlock.text ||
              clientBlock.content ||
              (clientBlock.attachment && clientBlock.attachment.url) ||
              ""
          );
        } else {
          setClientText("No Client content found.");
        }
      } catch (err) {
        console.error("Error fetching About channel:", err);
        setError("Error fetching About data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAboutChannel();
  }, []);

  if (loading) {
    return (
      <div className={styles.aboutContainer}>
        <h1 className={styles.title}>About Sj</h1>
        <p className={styles.paragraph}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.aboutContainer}>
        <h1 className={styles.title}>About Sj</h1>
        <p className={styles.paragraph}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.aboutContainer}>
      <div className={styles.leftSide}>
        <Canvas>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Center>
            <RotatingModel modelPath={modelPath} />
          </Center>
        </Canvas>
      </div>
      <div className={styles.rightSide}>
        <div className={styles.clientTextContainer}>
          <h2 className={styles.clientTextTitle}>About Me</h2>
          <div
            className={styles.paragraph}
            dangerouslySetInnerHTML={{
              __html: aboutText
                .replace(/\n/g, "<br />")
                .replace(/\s{2,}/g, (match) => "&nbsp;".repeat(match.length)),
            }}
          ></div>
        </div>
        <br />
        <div className={styles.clientTextContainer}>
          <h2 className={styles.clientTextTitle}>Contact</h2>
          <div className={styles.contactParagraph}>
            I am always open to new opportunities and collaborations. Feel free
            to reach out to me via email at{" "}
            <a href="mailto:sjwilliamsbusiness@yahoo.com">
              sjwilliamsbusiness@yahoo.com
            </a>
            .
          </div>
        </div>
        <div className={styles.clientTextContainer}>
          <h2 className={styles.clientTextTitle}>Follow Me</h2>
          <div className={styles.contactParagraph}>
            <a
              href="https://www.linkedin.com/in/steve-williams-jnr-233b521b4/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <br />
            <a
              href="https://substack.com/@d3spacitospider"
              target="_blank"
              rel="noopener noreferrer"
            >
              Substack
            </a>
            <br />
            <a
              href="https://www.instagram.com/sjwilliams_/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
        <div className={styles.clientTextContainer}>
          <h2 className={styles.clientTextTitle}> I'm Good At</h2>
          <div className={styles.contactParagraph}>
            <h3> Creative + Production Skills </h3>
            <ul>
              <li>Creative Direction & Consultation</li>
              <li>Photography (Film & Digital)</li>
              <li>Video Production & Producing</li>
              <li>Basic Video Editing (iMovie, Adobe Premiere Pro)</li>
              <li>Art Direction & Set Styling</li>
              <li>Deck Creation & Visual Storytelling</li>
            </ul>
            <br />
            <h3> Strategy + Marketing </h3>
            <ul>
              <li>Brand Strategy & Marketing</li>
              <li>Content Strategy</li>
              <li>Public Relations & Communications </li>
              <li>Social Media Campaign Execution</li>
            </ul>
            <br />
            <h3> Project + Client Management</h3>
            <ul>
              <li>Project Management</li>
              <li>Client & Relationship Management</li>
              <li>Budgeting & Vendor Coordination</li>
              <li>Event Planning & Curation</li>
            </ul>
            <br />
            <h3> Project + Client Management</h3>
            <ul>
              <li>Adobe Creative Cloud (Photoshop, InDesign, Illustrator)</li>
              <li>Figma</li>
              <li> Canva </li>
              <li>Microsoft Office Suite</li>
              <li>iMovie</li>
            </ul>
          </div>
        </div>
        <div className={styles.clientTextContainer}>
          <h2 className={styles.clientTextTitle}>Clients / Features </h2>
          <p className={styles.clientParagraph}>{clientText}</p>
        </div>
      </div>
    </div>
  );
};

export default About;
