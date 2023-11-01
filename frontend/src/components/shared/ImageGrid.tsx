import { useEffect, useState } from "react";
import { ImageLightbox } from "~/components/main";
import { useModal } from "~/hooks";

interface IProps {
  images: string[];
}

const ImageGrid: React.FC<IProps> = ({ images }) => {
  const { isOpen, closeModal, openModal } = useModal();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPostVideo, setIsPostVideo] = useState(false);

  const onClickImage = (e: any) => {
    if (e.target.dataset) {
      const idx = e.target.dataset.index;

      setActiveIndex(idx);
      // setting state is async
      // so we need to add set timeout so that we give the correct index to lightbox
      setTimeout(openModal, 100);
    }
  };

  const onCloseLightbox = () => {
    closeModal();
    setActiveIndex(0);
  };

  function isMP4(url: any) {
    // Regex pattern để kiểm tra phần mở rộng của URL có phải là .mp4 hay không
    var pattern = /\.mp4($|\?)/i; // Phần mở rộng .mp4, kết thúc hoặc theo sau bởi dấu '?' (query string)

    // Kiểm tra xem URL có khớp với regex pattern hay không
    return pattern.test(url);
  }

  useEffect(() => {
    if (isMP4(images[0])) {
      setIsPostVideo(true);
    }
  }, [images]);

  const renderGrid = () => {
    if (isMP4(images[0])) {
      return `
            <div class="custom-grid">
                <video controls autoplay src=${images[0]} alt="Can't open video" class="grid-img" data-index="0" style="margin-bottom: 20px" />
            </div>
        `;
    }
    switch (images.length) {
      case 1:
        return `
                    <div class="custom-grid">
                        <img src=${images[0]} class="grid-img" data-index="0"/>
                    </div>
                `;
      case 2:
        return `
                    <div class="custom-grid custom-grid-rows-2">
                        <img src=${images[0]} class="grid-img" data-index="0"/>
                        <img src=${images[1]} class="grid-img" data-index="1"/>
                    </div>
                `;
      case 3:
        return `
                    <div class="custom-grid custom-grid-rows-2">
                        <div class="custom-grid">
                            <img src=${images[0]} class="grid-img" data-index="0"/>
                        </div>
                        <div class="custom-grid custom-grid-cols-2">
                            <img src=${images[1]} class="grid-img" data-index="1"/>
                            <img src=${images[2]} class="grid-img" data-index="2"/>
                        </div>
                    </div>
                `;
      case 4:
        return `
                    <div class="custom-grid custom-grid-rows-2">
                        <div class="custom-grid custom-grid-cols-2">
                            <img src=${images[0]} class="grid-img" data-index="0"/>
                            <img src=${images[1]} class="grid-img" data-index="1"/>
                        </div>
                        <div class="custom-grid custom-grid-cols-2">
                            <img src=${images[2]} class="grid-img" data-index="2"/>
                            <img src=${images[3]} class="grid-img" data-index="3"/>
                        </div>
                    </div>
                `;
      case 5:
        return `
                    <div class="custom-grid custom-grid-rows-2">
                        <div class="custom-grid custom-grid-cols-2">
                            <img src=${images[0]} class="grid-img" data-index="0" />
                            <img src=${images[1]} class="grid-img" data-index="1" />
                        </div>
                        <div class="custom-grid custom-grid-cols-3">
                            <img src=${images[2]} class="grid-img" data-index="2" />
                            <img src=${images[3]} class="grid-img" data-index="3" />
                            <img src=${images[4]} class="grid-img" data-index="4" />
                        </div>
                    </div>
                `;
      default:
        return `
                    <div class="custom-grid-items custom-grid-items-2">
                        <img src=${images[0]} class="grid-img"/>
                    </div>
                `;
    }
  };
  return (
    <>
      <div
        // className="w-full h-25rem overflow-hidden"
        className="w-full overflow-hidden"
        dangerouslySetInnerHTML={{ __html: renderGrid() }}
        onClick={(e) => {
          if (!isPostVideo) {
            onClickImage(e);
          }
        }}
      ></div>
      <ImageLightbox
        activeIndex={activeIndex}
        isOpen={isOpen}
        closeLightbox={onCloseLightbox}
        images={images}
      />
    </>
  );
};

export default ImageGrid;
