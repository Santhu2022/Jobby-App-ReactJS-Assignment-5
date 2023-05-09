import Loader from 'react-loader-spinner'

import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

const ProfileDetails = props => {
  const renderProfile = () => {
    const {profileDetails} = props
    const {name, profileImageUrl, shortBio} = profileDetails

    return (
      <div className="profile-details-container">
        <img src={profileImageUrl} alt="profile" className="profile-image" />
        <h1 className="profile-name">{name}</h1>
        <p className="profile-bio">{shortBio}</p>
      </div>
    )
  }

  const renderProfileFailure = () => {
    const {getProfileDetails} = props
    return (
      <div className="profile-failure-container">
        <button
          className="retry-button"
          type="button"
          onClick={getProfileDetails}
        >
          Retry
        </button>
      </div>
    )
  }

  const renderProfileLoader = () => (
    <div className="loader-container-profile" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  const {profileApiStatus} = props

  switch (profileApiStatus) {
    case apiStatusConstants.inProgress:
      return renderProfileLoader()
    case apiStatusConstants.success:
      return renderProfile()
    case apiStatusConstants.failure:
      return renderProfileFailure()
    default:
      return null
  }
}

export default ProfileDetails
