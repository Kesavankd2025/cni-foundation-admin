import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useState } from 'react'
import ReactPlayer from 'react-player'
import { Link } from 'react-router-dom'

const VideosWithContent = () => {
  const [isOpen, setOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState(null)

  const openVideo = (url) => {
    setVideoUrl(url)
    setOpen(true)
  }

  return (
    <div className="col-xxl-6">
      <div className="card h-100 p-0">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <h6 className="text-lg fw-semibold mb-0">Videos With Content</h6>
        </div>

        <div className="card-body p-24">
          <div className="row gy-4">
            {/* VIDEO 1 */}
            <div className="col-sm-6">
              <div className="border bg-base radius-8 overflow-hidden">
                <div className="position-relative max-h-258-px overflow-hidden">
                  <img
                    src="assets/images/videos/video-img2.png"
                    className="w-100 object-fit-cover"
                    alt=""
                  />
                  <Link
                    to="#"
                    onClick={() =>
                      openVideo('https://www.youtube.com/watch?v=Vr9WoWXkKeE')
                    }
                    className="magnific-video bordered-shadow w-56-px h-56-px bg-white rounded-circle d-flex justify-content-center align-items-center position-absolute start-50 top-50 translate-middle z-1"
                  >
                    <Icon icon="ion:play" className="text-primary-600 text-xxl" />
                  </Link>
                </div>
                <div className="p-16">
                  <h6 className="text-xl mb-6">This is Video title</h6>
                  <p className="text-secondary-light mb-0">
                    We quickly learn to fear and thus automatically avoid
                    potentially stressful
                  </p>
                </div>
              </div>
            </div>

            {/* VIDEO 2 */}
            <div className="col-sm-6">
              <div className="border bg-base radius-8 overflow-hidden">
                <div className="position-relative max-h-258-px overflow-hidden">
                  <img
                    src="assets/images/videos/video-img3.png"
                    className="w-100 object-fit-cover"
                    alt=""
                  />
                  <Link
                    to="#"
                    onClick={() =>
                      openVideo('https://www.youtube.com/watch?v=Vr9WoWXkKeE')
                    }
                    className="magnific-video bordered-shadow w-56-px h-56-px bg-white rounded-circle d-flex justify-content-center align-items-center position-absolute start-50 top-50 translate-middle z-1"
                  >
                    <Icon icon="ion:play" className="text-primary-600 text-xxl" />
                  </Link>
                </div>
                <div className="p-16">
                  <h6 className="text-xl mb-6">This is Video title here</h6>
                  <p className="text-secondary-light mb-0">
                    We quickly learn to fear and thus automatically avoid
                    potentially stressful
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO MODAL */}
      {isOpen && (
        <div className="video-modal-backdrop">
          <div className="video-modal">
            <button
              className="video-close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <ReactPlayer
              url={videoUrl}
              playing
              controls
              width="100%"
              height="100%"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default VideosWithContent
