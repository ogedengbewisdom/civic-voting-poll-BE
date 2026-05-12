export interface IVotes {
  user_id: number;
  state_id: number;
  poll_id: number;
  option_id: number;
}

export interface IStateBreakdown {
  state_id: number;
  state_name: string;
  count: number;
}

export interface IOptionResult {
  option_id: number;
  option_text: string;
  total_votes: number;
  by_state: IStateBreakdown[];
}

export interface IRawVoteRow {
  option_id: string;
  option_text: string;
  state_id: string;
  state_name: string;
  count: string;
}

export interface IState {
  state_id: number;
  state_name: string;
  count: number;
}

export interface IPollResultSummary {
  total_votes: number;
  leading_option: string | undefined;
  states_voting: number;
}

export interface IPollResultOption {
  option_id: number;
  option_text: string;
  total_votes: number;
  percentage: number;
  by_state: IStateBreakdown[];
}

export interface IPollResult {
  poll_id: number;
  title: string;
  description: string;
  status: string;
  summary: IPollResultSummary;
  poll_option: IPollResultOption[];
  all_states: IState[];
}
