import {Component} from 'react'
import Cookies from 'js-cookie'
import {BsSearch} from 'react-icons/bs'

import Header from '../Header'
import ProfileDetails from '../ProfileDetails'
import FiltersGroup from '../FiltersGroup'
import JobCard from '../JobCard'

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
    jobsList: [],
    jobsApiStatus: apiStatusConstants.initial,
    searchInput: '',
    activeSalaryRangeId: '',
    employmentTypesChecked: [],
  }

  componentDidMount() {
    this.getProfileDetails()
    this.getJobs()
  }

  updateEmploymentTypesChecked = typeId => {
    const {employmentTypesChecked} = this.state
    let updatedList = employmentTypesChecked
    if (employmentTypesChecked.includes(typeId)) {
      updatedList = employmentTypesChecked.filter(
        eachType => eachType !== typeId,
      )
    } else {
      updatedList = [...updatedList, typeId]
    }

    this.setState({employmentTypesChecked: updatedList}, this.getJobs)
  }

  updateSalaryRangeId = activeSalaryRangeId =>
    this.setState({activeSalaryRangeId}, this.getJobs)

  getJobs = async () => {
    this.setState({jobsApiStatus: apiStatusConstants.inProgress})

    const {
      activeSalaryRangeId,
      employmentTypesChecked,
      searchInput,
    } = this.state
    const employTypes = employmentTypesChecked.join(',')
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employTypes}&minimum_package=${activeSalaryRangeId}&search=${searchInput}`

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
          onChange={e =>
            this.setState({searchInput: e.target.value.toLowerCase()})
          }
        />
        <button
          className="search-button"
          type="button"
          data-testid="searchButton"
          onClick={() => this.getJobs()}
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    )
  }

  renderSideBar = () => {
    const {
      profileDetails,
      profileApiStatus,
      activeSalaryRangeId,
      employmentTypesChecked,
    } = this.state
    return (
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
          updateEmploymentTypesChecked={this.updateEmploymentTypesChecked}
          employmentTypesChecked={employmentTypesChecked}
        />
      </div>
    )
  }

  renderJobsList = () => {
    const {jobsList} = this.state
    return (
      <>
        {jobsList.length > 0 ? (
          <ul className="jobs-list">
            {jobsList.map(eachJob => (
              <JobCard key={eachJob.id} jobDetails={eachJob} />
            ))}
          </ul>
        ) : (
          <h1>No Jobs Found</h1>
        )}
      </>
    )
  }

  renderJobsBasedOnAPiStatus = () => {
    const {jobsApiStatus} = this.state

    switch (jobsApiStatus) {
      case apiStatusConstants.success:
        return this.renderJobsList()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="jobs-page-container">
        <Header />
        <div className="jobs-page">
          {this.renderSideBar()}
          <div className="jobs-container">
            {this.renderSearchBar('largeSearchBar')}
            {this.renderJobsBasedOnAPiStatus()}
          </div>
        </div>
      </div>
    )
  }
}
export default Jobs
