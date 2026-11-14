import styled from 'styled-components';
import { Images } from '../../../assets/images';

interface SignInProps {
  signinIn?: boolean;
}

export const Container = styled.div`
  background-color: rgba(12, 12, 12, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55),
              0 0 0 1px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  width: 820px;
  max-width: 100%;
  min-height: 540px;
`;

export const SignUpContainer = styled.div.attrs<SignInProps>(
  ({ signinIn, ...props }) => props
)<SignInProps>`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
  ${({ signinIn }) =>
    signinIn !== true &&
    `
      transform: translateX(100%);
      opacity: 1;
      z-index: 5;
    `}
`;

export const SignInContainer = styled.div<SignInProps>`
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
  left: 0;
  width: 50%;
  z-index: 2;
  ${({ signinIn }) => signinIn !== true && `transform: translateX(100%);`}
`;

export const Form = styled.form`
  background-color: #101010;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 64px;
  height: 100%;
  text-align: center;
`;

export const Title = styled.h1`
  font-weight: 700;
  font-size: 2rem;
  letter-spacing: -0.02em;
  margin: 0;
  color: #ffffff;
`;

export const Subtitle = styled.p`
  margin: 10px 0 26px;
  font-size: 14px;
  font-weight: 400;
  color: #9a9a9a;
`;

export const Input = styled.input`
  background-color: rgba(255, 255, 255, 0.06);
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 14px 22px;
  margin: 7px 0;
  width: 100%;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
  &::placeholder {
    color: #8c8c8c;
  }
  &:hover {
    border-color: rgba(255, 255, 255, 0.28);
  }
  &:focus {
    border-color: rgb(229, 9, 20);
    background-color: rgba(255, 255, 255, 0.09);
    box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.25);
    outline: none;
  }
`;

export const Button = styled.button`
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, rgb(229, 9, 20) 0%, rgb(166, 7, 15) 100%);
  box-shadow: 0 10px 26px rgba(229, 9, 20, 0.35);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  padding: 14px 48px;
  margin-top: 18px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: transform 0.15s ease, box-shadow 0.25s ease, filter 0.25s ease;
  cursor: pointer;
  &:hover {
    filter: brightness(1.12);
    box-shadow: 0 14px 32px rgba(229, 9, 20, 0.45);
    transform: translateY(-1px);
  }
  &:active {
    transform: scale(0.97);
  }
  &:focus {
    outline: none;
  }
`;

export const GhostButton = styled(Button)`
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  box-shadow: none;
  margin-top: 0;
  &:hover {
    background-color: #ffffff;
    color: rgb(229, 9, 20);
    filter: none;
    box-shadow: none;
    transform: translateY(-1px);
  }
`;

export const Anchor = styled.a`
  color: #a8a8a8;
  font-size: 13px;
  text-decoration: none;
  margin: 16px 0 4px;
  transition: color 0.25s ease;
  &:hover {
    color: rgb(229, 9, 20);
  }
`;

export const OverlayContainer = styled.div<SignInProps>`
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
  ${({ signinIn }) => signinIn !== true && `transform: translateX(-100%);`}
`;

export const Overlay = styled.div<SignInProps>`
  background:
    linear-gradient(135deg, rgba(229, 9, 20, 0.88) 0%, rgba(166, 7, 15, 0.82) 48%, rgba(10, 10, 10, 0.92) 100%),
    url(${Images.footerImg});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  ${({ signinIn }) => signinIn !== true && `transform: translateX(50%);`}
`;

export const OverlayPanel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
`;

export const LeftOverlayPanel = styled(OverlayPanel)<SignInProps>`
  transform: translateX(-20%);
  ${({ signinIn }) => signinIn !== true && `transform: translateX(0);`}
`;

export const RightOverlayPanel = styled(OverlayPanel)<SignInProps>`
  right: 0;
  transform: translateX(0);
  ${({ signinIn }) => signinIn !== true && `transform: translateX(20%);`}
`;

export const Paragraph = styled.p`
  font-size: 15px;
  font-weight: 300;
  line-height: 1.65;
  letter-spacing: 0.4px;
  margin: 18px 0 30px;
  color: rgba(255, 255, 255, 0.78);
`;
