import React from 'react';
import { Link } from 'react-router-dom';

interface GovLayoutProps {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export default function GovLayout({ children, backHref, backLabel }: GovLayoutProps): React.JSX.Element {
  return (
    <>
      <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
        Skip to main content
      </a>

      <header className="govuk-header" role="banner" data-module="govuk-header">
        <div className="govuk-header__container govuk-width-container">
          <div className="govuk-header__logo">
            <a href="/" className="govuk-header__link govuk-header__link--homepage">
              <span className="govuk-header__logotype">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="govuk-header__logotype-crown"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 30"
                  height="30"
                  width="32"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M22.6 10.4c-1 .4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m-5.9 6.7c-.9.4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m10.8-3.7c-1 .4-2-.1-2.4-1-.4-.9.1-2 1-2.4.9-.4 2 .1 2.4 1s-.1 2-1 2.4m3-6.7c-.9.4-2-.1-2.4-1-.4-.9-.1-2 .9-2.4.9-.4 2 .1 2.4 1s-.1 2-.9 2.4M2 0h8L8 2H6v2h2L6 6H4V4H2V2H0V0h2zm0 0"
                  />
                </svg>
              </span>
            </a>
          </div>
          <div className="govuk-header__content">
            <a href="/" className="govuk-header__link govuk-header__service-name">
              PDF to Digital Form Builder
            </a>
          </div>
        </div>
      </header>

      <div className="govuk-width-container">
        <div className="govuk-phase-banner">
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">Beta</strong>
            <span className="govuk-phase-banner__text">
              This is a new service – your{' '}
              <a className="govuk-link" href="#">
                feedback
              </a>{' '}
              will help us to improve it.
            </span>
          </p>
        </div>

        {backHref && (
          <Link to={backHref} className="govuk-back-link">
            {backLabel ?? 'Back'}
          </Link>
        )}

        <main className="govuk-main-wrapper" id="main-content" role="main">
          {children}
        </main>
      </div>

      <footer className="govuk-footer" role="contentinfo">
        <div className="govuk-width-container">
          <div className="govuk-footer__meta">
            <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
              <h2 className="govuk-visually-hidden">Support links</h2>
              <ul className="govuk-footer__inline-list">
                <li className="govuk-footer__inline-list-item">
                  <a className="govuk-footer__link" href="#">
                    Help
                  </a>
                </li>
                <li className="govuk-footer__inline-list-item">
                  <a className="govuk-footer__link" href="#">
                    Cookies
                  </a>
                </li>
                <li className="govuk-footer__inline-list-item">
                  <a className="govuk-footer__link" href="#">
                    Accessibility statement
                  </a>
                </li>
              </ul>
            </div>
            <div className="govuk-footer__meta-item">
              <a
                className="govuk-footer__link govuk-footer__copyright-logo"
                href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/"
              >
                © Crown copyright
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
