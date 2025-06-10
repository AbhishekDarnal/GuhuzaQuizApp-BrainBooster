"use client";
import {
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "next-share";
 
export default function SocialShare({ score }: { score: number }) {
  const shareMessage = `I just scored ${score} points on Guhuza Brain Boost! Try it yourself and see how far you go!`;
 
  return (
    <div className="flex justify-center gap-4 mt-4">
      <FacebookShareButton url={'https://guhuzaquizapp.com'} quote={shareMessage}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
 
      <LinkedinShareButton url={'https://guhuzaquizapp.com'}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
 
      <TwitterShareButton url={'https://guhuzaquizapp.com'} title={shareMessage}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
 
      <WhatsappShareButton url={'https://guhuzaquizapp.com'} title={shareMessage}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
    </div>
  );
}
