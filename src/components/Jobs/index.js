import {Component} from 'react'
import Cookies from 'js-cookie'
import {BsSearch} from 'react-icons/bs'

import Header from '../Header'
import ProfileDetails from '../ProfileDetails'
import FiltersGroup from '../FiltersGroup'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    profileDetails: {},
    profileApiStatus: apiStatusConstants.initial,
    searchInput: '',
    activeSalaryRangeId: '',
    jobsList: [],
    jobsApiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getProfileDetails()
    this.getJobs()
  }

  updateSalaryRangeId = activeSalaryRangeId =>
    this.setState({activeSalaryRangeId}, this.getJobs)

  getJobs = async () => {
    this.setState({jobsApiStatus: apiStatusConstants.inProgress})

    const {activeSalaryRangeId} = this.state

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=FULLTIME,PARTTIME&minimum_package=${activeSalaryRangeId}&search=`
    console.log(apiUrl)

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()
    if (response.ok === true) {
      const {jobs} = data
      const updatedData = jobs.map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        title: eachJob.title,
      }))

      updatedData.forEach(each => console.log(each.packagePerAnnum))

      this.setState({
        jobsList: updatedData,
        jobsApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({jobsApiStatus: apiStatusConstants.failure})
    }
  }

  getProfileDetails = async () => {
    this.setState({profileApiStatus: apiStatusConstants.inProgress})

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()
    if (response.ok === true) {
      const profileDetails = data.profile_details
      const updatedData = {
        name: profileDetails.name,
        profileImageUrl: profileDetails.profile_image_url,
        shortBio: profileDetails.short_bio,
      }
      setTimeout(() => {
        this.setState({
          profileDetails: updatedData,
          profileApiStatus: apiStatusConstants.success,
        })
      }, 500)
    } else {
      this.setState({profileApiStatus: apiStatusConstants.failure})
    }
  }

  renderSearchBar = searchBarID => {
    const {searchInput} = this.state
    return (
      <div className="search-bar" id={searchBarID}>
        <input
          className="search-input"
          type="search"
          placeholder="Search"
          value={searchInput}
          onChange={e => this.setState({searchInput: e.target.value})}
        />
        <button
          className="search-button"
          type="button"
          data-testid="searchButton"
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    )
  }

  render() {
    const {profileDetails, profileApiStatus, activeSalaryRangeId} = this.state
    return (
      <div className="jobs-page-container">
        <Header />
        <div className="jobs-page">
          <div className="side-bar">
            {this.renderSearchBar('smallSearchBar')}
            <ProfileDetails
              profileDetails={profileDetails}
              profileApiStatus={profileApiStatus}
              getProfileDetails={this.getProfileDetails}
            />
            <hr className="separator" />
            <FiltersGroup
              updateSalaryRangeId={this.updateSalaryRangeId}
              activeSalaryRangeId={activeSalaryRangeId}
            />
          </div>
        </div>
      </div>
    )
  }
}
export default Jobs
