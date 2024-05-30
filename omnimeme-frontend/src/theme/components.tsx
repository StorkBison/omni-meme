import styled from "styled-components";

export const InputButton = styled.button`
    margin-left: 0.5rem;
    margin-right: 0.5rem;

    :hover {
        cursor: pointer;

        svg {
            stroke: #986db2 !important;
        }
    }

    :disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

export const NormalButton = styled.button`
    width: 90%;
    background-image: url('/assets/imgs/button.png');
    background-size: 100% 100%;
    transition: all 0.3s;
    font-weight: 700;
    font-size: 28px;
    text-align: center;
    color: #fff;
    &:hover {
        background-image: url("/assets/imgs/button-hover.png");
    }
`;

export const BorderButton = styled(NormalButton)`
    border: 2px solid #ffaf4c;
    background: #1e1e1e;
    color: #ffaf4c;
`;
