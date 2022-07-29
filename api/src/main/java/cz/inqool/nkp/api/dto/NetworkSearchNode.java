package cz.inqool.nkp.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class NetworkSearchNode {
    String name;
    List<NetworkSearchLinkCount> links = new ArrayList<>();
}
