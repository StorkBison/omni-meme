import styled from 'styled-components';
import { NavBar } from '../../components/NavBar';
import HeroSection from '../../components/Hero';
import { useMediaQuery } from 'usehooks-ts';

const Wrapper = styled.div`
  position: relative;
`;

export const LandingPage = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <Wrapper>
      {isMobile ? <NavBar /> : <NavBar />}
      {isMobile ? <HeroSection /> : <HeroSection />}
    </Wrapper>
  );
};

export default LandingPage;
