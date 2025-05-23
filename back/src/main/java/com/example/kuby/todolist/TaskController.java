package com.example.kuby.todolist;

import com.example.kuby.security.context.TokenClaimContext;
import com.example.kuby.security.util.formaters.LocalDateTimeParser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static com.example.kuby.security.constant.JwtClaimKey.USER_ID;

@RestController
@RequestMapping("/api/task")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskDTO> create(@RequestBody @Valid CreateTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.create(
                request.getName(),
                TokenClaimContext.getIdByKey(USER_ID),
                request.getDeadLine(),
                request.getIsFinished(),
                request.getNotificationDateTime()
        ));
    }

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAll() {
        return ResponseEntity.ok(taskService.getAll(TokenClaimContext.getIdByKey(USER_ID)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> update(@PathVariable String id,
                                          @RequestParam(required = false) String name,
                                          @RequestParam(required = false) String deadLine,
                                          @RequestParam(required = false) String notificationDateTime) {
        return ResponseEntity.ok(
                taskService.update(UUID.fromString(id), name,
                        deadLine != null ? LocalDateTimeParser.parse(deadLine) : null,
                        TokenClaimContext.getIdByKey(USER_ID),
                        notificationDateTime != null ? LocalDateTimeParser.parse(notificationDateTime) : null
                )
        );
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskDTO> finish(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.finish(id, TokenClaimContext.getIdByKey(USER_ID)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        taskService.delete(id, TokenClaimContext.getIdByKey(USER_ID));
        return ResponseEntity.noContent().build();
    }
}
