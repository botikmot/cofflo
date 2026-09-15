import { useQuery } from "@tanstack/react-query";

import { tableSessionService } from "@/services/table-session.service";

type UseTableSessionParams = {
  organizationId?: string;
  branchId?: string;
  sessionId?: string;
};

export function useTableSession({
  organizationId,
  branchId,
  sessionId,
}: UseTableSessionParams) {
  return useQuery({
    queryKey: ["table-session", organizationId, branchId, sessionId],
    queryFn: () =>
      tableSessionService.getSession(organizationId!, branchId!, sessionId!),
    enabled: Boolean(organizationId && branchId && sessionId),
  });
}
